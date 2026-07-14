import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, BOT_MODEL } from "@/lib/anthropic/client";
import { toolDefinitions, executeTool } from "@/lib/anthropic/tools";
import { query } from "@/lib/db";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";

const MAX_TOOL_ITERATIONS = 5;
const HISTORY_LIMIT = 20;
const TRANSITION_MESSAGE =
  "Já te conectei com a nossa equipe, só um instante que já te respondemos por aqui! 💛";

type BotConfigRow = {
  system_prompt: string;
  escalation_keywords: string[];
  active: boolean;
};

type ConversationRow = {
  id: string;
  phone_number: string;
  status: string;
};

type MessageRow = {
  direction: "inbound" | "outbound";
  sender_type: string;
  content: string | null;
};

function matchesEscalationKeyword(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((k) => k && normalized.includes(k.toLowerCase()));
}

/** Processa a mensagem mais recente de uma conversa e, se aplicável, responde automaticamente. */
export async function processBotReply(conversationId: string) {
  const { rows: configRows } = await query<BotConfigRow>(
    `select system_prompt, escalation_keywords, active from bot_config where id = 1`
  );
  const config = configRows[0];
  if (!config?.active) return;

  const { rows: convRows } = await query<ConversationRow>(
    `select id, phone_number, status from whatsapp_conversations where id = $1`,
    [conversationId]
  );
  const conversation = convRows[0];
  if (!conversation || conversation.status !== "bot_active") return;

  const { rows: history } = await query<MessageRow>(
    `select direction, sender_type, content from whatsapp_messages
     where conversation_id = $1
     order by created_at desc
     limit $2`,
    [conversationId, HISTORY_LIMIT]
  );
  const orderedHistory = history.reverse();
  const lastInbound = [...orderedHistory].reverse().find((m) => m.direction === "inbound");

  if (lastInbound?.content && matchesEscalationKeyword(lastInbound.content, config.escalation_keywords)) {
    await escalateAndNotify(conversationId, conversation.phone_number, "Palavra-chave de escalonamento detectada.");
    return;
  }

  const messages: Anthropic.MessageParam[] = orderedHistory
    .filter((m) => m.content)
    .map((m) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.content as string,
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return; // nada novo do cliente para responder
  }

  const anthropic = getAnthropicClient();
  const ctx = { conversationId, clientPhone: conversation.phone_number };

  let finalText: string | null = null;
  let escalated = false;

  for (let i = 0; i < MAX_TOOL_ITERATIONS && !finalText && !escalated; i++) {
    const response = await anthropic.messages.create({
      model: BOT_MODEL,
      max_tokens: 1024,
      system: config.system_prompt,
      tools: toolDefinitions,
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      finalText = textBlock?.text ?? null;
      break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const { output, escalated: didEscalate } = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        ctx
      );

      await query(
        `insert into bot_tool_calls (conversation_id, tool_name, input, output) values ($1, $2, $3, $4)`,
        [conversationId, block.name, JSON.stringify(block.input), JSON.stringify(output)]
      );

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(output),
      });

      if (didEscalate) escalated = true;
    }

    messages.push({ role: "user", content: toolResults });
  }

  if (escalated) {
    await sendAndStore(conversationId, conversation.phone_number, finalText ?? TRANSITION_MESSAGE);
    await query(`update whatsapp_conversations set status = 'human_active' where id = $1`, [
      conversationId,
    ]);
    return;
  }

  if (finalText) {
    await sendAndStore(conversationId, conversation.phone_number, finalText);
  }
}

async function escalateAndNotify(conversationId: string, phone: string, reason: string) {
  await query(`update whatsapp_conversations set status = 'human_active' where id = $1`, [
    conversationId,
  ]);
  await query(
    `insert into bot_tool_calls (conversation_id, tool_name, input, output) values ($1, 'escalate_to_human', $2, $3)`,
    [conversationId, JSON.stringify({ reason }), JSON.stringify({ escalated: true, reason })]
  );
  await sendAndStore(conversationId, phone, TRANSITION_MESSAGE);
}

/** Envia a resposta e grava o registro independentemente do envio ter sucesso —
 * assim a equipe consegue ver o que o bot respondeu mesmo se o WhatsApp falhar
 * (ex.: credenciais ainda não configuradas), e reenviar manualmente depois. */
async function sendAndStore(conversationId: string, phone: string, content: string) {
  let status = "sent";
  try {
    await sendWhatsAppTextMessage(phone, content);
  } catch (err) {
    console.error("[bot] Failed to send WhatsApp message", conversationId, err);
    status = "failed";
  }

  await query(
    `insert into whatsapp_messages (conversation_id, direction, sender_type, content, message_type, status)
     values ($1, 'outbound', 'bot', $2, 'text', $3)`,
    [conversationId, content, status]
  );
  await query(`update whatsapp_conversations set last_message_at = now() where id = $1`, [
    conversationId,
  ]);
}
