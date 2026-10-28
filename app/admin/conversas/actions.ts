"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import {
  sendWhatsAppTextMessage,
  sendReopenConversationMessage,
  sendFirstContactTemplateMessage,
} from "@/lib/whatsapp/client";
import { getConversationRecipient } from "@/lib/whatsapp/recipient";

export async function sendManualReply(formData: FormData) {
  await requireAuth();

  const conversationId = String(formData.get("conversation_id"));
  const content = String(formData.get("content") ?? "").trim();

  if (!conversationId || !content) {
    throw new Error("Escreva uma mensagem antes de enviar.");
  }

  const recipient = await getConversationRecipient(conversationId);
  const whatsappMessageId = await sendWhatsAppTextMessage(recipient, content);

  await query(
    `insert into whatsapp_messages
       (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, status)
     values ($1, 'outbound', 'human', $2, 'text', $3, 'sent')`,
    [conversationId, content, whatsappMessageId ?? null]
  );

  await query(
    `update whatsapp_conversations
     set last_message_at = now(), status = 'human_active'
     where id = $1`,
    [conversationId]
  );

  revalidatePath(`/admin/conversas/${conversationId}`);
  revalidatePath("/admin/conversas");
}

/**
 * Reabre a conversa mandando um template aprovado — necessário quando a Meta
 * bloqueia texto livre (cliente nunca respondeu, ou já se passaram 24h desde a
 * última mensagem dela). Se a conversa nunca teve mensagem nenhuma, usa o
 * template de primeiro contato (personalizado com o nome); caso contrário, usa
 * o template genérico de reengajamento ("Olá!").
 */
export async function sendReactivationMessage(
  conversationId: string,
  clientFirstName?: string
) {
  await requireAuth();

  const recipient = await getConversationRecipient(conversationId);

  const { rows: existing } = await query<{ id: string }>(
    `select id from whatsapp_messages where conversation_id = $1 limit 1`,
    [conversationId]
  );

  const { messageId, content } =
    existing.length === 0 && clientFirstName
      ? await sendFirstContactTemplateMessage(recipient, clientFirstName)
      : await sendReopenConversationMessage(recipient);

  await query(
    `insert into whatsapp_messages
       (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, status)
     values ($1, 'outbound', 'human', $2, 'template', $3, 'sent')`,
    [conversationId, content, messageId ?? null]
  );

  await query(`update whatsapp_conversations set last_message_at = now() where id = $1`, [
    conversationId,
  ]);

  revalidatePath(`/admin/conversas/${conversationId}`);
  revalidatePath("/admin/conversas");
}

export async function markConversationRead(conversationId: string) {
  await requireAuth();
  await query(`update whatsapp_conversations set unread_count = 0 where id = $1`, [
    conversationId,
  ]);
  revalidatePath("/admin/conversas");
}
