import { createHmac, timingSafeEqual } from "node:crypto";
import { getPool } from "@/lib/db";
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

  // Sempre responde 200 rapidamente depois daqui — a Meta reenvia em retry
  // agressivo se não receber 200, o que causaria mensagens duplicadas.
  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }

  try {
    await processWebhookPayload(payload);
  } catch (err) {
    console.error("[whatsapp webhook] Failed to process payload", err);
  }

  return new Response("OK", { status: 200 });
}

async function processWebhookPayload(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") return;

  const pool = getPool();

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

          const { rows: convRows } = await client.query<{ id: string; unread_count: number }>(
            `insert into whatsapp_conversations (client_id, phone_number, status, last_message_at, unread_count)
             values ($1, $2, 'human_active', now(), 1)
             on conflict (phone_number) do update
               set last_message_at = now(),
                   unread_count = whatsapp_conversations.unread_count + 1,
                   client_id = excluded.client_id
             returning id, unread_count`,
            [clientId, phone]
          );
          const conversationId = convRows[0].id;

          await client.query(
            `insert into whatsapp_messages
               (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, raw_payload)
             values ($1, 'inbound', 'client', $2, $3, $4, $5)
             on conflict (whatsapp_message_id) do nothing`,
            [conversationId, content, message.type, message.id, JSON.stringify(message)]
          );

          await client.query("commit");
        } catch (err) {
          await client.query("rollback");
          throw err;
        } finally {
          client.release();
        }
      }

      for (const status of value.statuses ?? []) {
        await pool.query(`update whatsapp_messages set status = $1 where whatsapp_message_id = $2`, [
          status.status,
          status.id,
        ]);
      }
    }
  }
}
