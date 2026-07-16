import { createHmac, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { getPool } from "@/lib/db";
import { processBotReply } from "@/lib/anthropic/bot";
import type { WhatsAppWebhookPayload } from "@/lib/whatsapp/types";

// GET: verificação do webhook exigida pela Meta ao configurar a URL no painel.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

function isValidSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn(
      "[whatsapp webhook] WHATSAPP_APP_SECRET não configurado — pulando verificação de assinatura (ok em dev, nunca em produção)."
    );
    return true;
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(received, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}

function normalizePhone(waId: string) {
  return waId.startsWith("+") ? waId : `+${waId}`;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }

  // Grava as mensagens agora (rápido) e devolve 200 imediatamente para a Meta
  // — ela reenvia agressivamente se não receber 200 a tempo, o que causaria
  // duplicatas. O bot (chamada à IA + envio da resposta) roda depois, via
  // after(), sem atrasar essa resposta.
  let conversationsWithNewMessages: string[] = [];
  try {
    conversationsWithNewMessages = await processWebhookPayload(payload);
  } catch (err) {
    console.error("[whatsapp webhook] Failed to process payload", err);
  }

  after(async () => {
    for (const conversationId of conversationsWithNewMessages) {
      try {
        await processBotReply(conversationId);
      } catch (err) {
        console.error("[whatsapp webhook] Bot processing failed", conversationId, err);
      }
    }
  });

  return new Response("OK", { status: 200 });
}

async function processWebhookPayload(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") return [];

  const pool = getPool();
  const conversationIds: string[] = [];

  const { rows: botConfigRows } = await pool.query<{ active: boolean }>(
    `select active from bot_config where id = 1`
  );
  const botActive = botConfigRows[0]?.active ?? false;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      for (const message of value.messages ?? []) {
        const phone = normalizePhone(message.from);
        const contactName = value.contacts?.find((c) => c.wa_id === message.from)?.profile.name;
        const content =
          message.text?.body ??
          (message.type !== "text" ? `[${message.type}]` : null);

        const client = await pool.connect();
        try {
          await client.query("begin");

          const { rows: clientRows } = await client.query<{ id: string }>(
            `insert into clients (full_name, phone)
             values ($1, $2)
             on conflict (phone) do update set full_name = coalesce(clients.full_name, excluded.full_name)
             returning id`,
            [contactName ?? phone, phone]
          );
          const clientId = clientRows[0].id;

          const initialStatus = botActive ? "bot_active" : "human_active";
          const { rows: convRows } = await client.query<{ id: string }>(
            `insert into whatsapp_conversations (client_id, phone_number, status, last_message_at, unread_count)
             values ($1, $2, $3, now(), 1)
             on conflict (phone_number) do update
               set last_message_at = now(),
                   unread_count = whatsapp_conversations.unread_count + 1,
                   client_id = excluded.client_id
             returning id`,
            [clientId, phone, initialStatus]
          );
          const conversationId = convRows[0].id;

          const { rowCount } = await client.query(
            `insert into whatsapp_messages
               (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, raw_payload)
             values ($1, 'inbound', 'client', $2, $3, $4, $5)
             on conflict (whatsapp_message_id) do nothing`,
            [conversationId, content, message.type, message.id, JSON.stringify(message)]
          );

          await client.query("commit");

          if (rowCount && rowCount > 0) {
            conversationIds.push(conversationId);
          }
        } catch (err) {
          await client.query("rollback");
          throw err;
        } finally {
          client.release();
        }
      }

      for (const status of value.statuses ?? []) {
        await pool.query(
          `update whatsapp_messages
           set status = $1, raw_payload = coalesce(raw_payload, '{}'::jsonb) || $2::jsonb
           where whatsapp_message_id = $3`,
          [status.status, JSON.stringify({ last_status: status }), status.id]
        );
      }
    }
  }

  return conversationIds;
}
