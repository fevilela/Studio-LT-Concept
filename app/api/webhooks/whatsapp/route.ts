import { createHmac, timingSafeEqual } from "node:crypto";
import type { PoolClient } from "pg";
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

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }

  // Grava as mensagens e devolve 200 rápido — a Meta reenvia se não receber 200
  // a tempo, o que causaria duplicatas (evitadas pelo unique em whatsapp_message_id).
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
        // Telefone pode não vir (cliente com nome de usuário); o BSUID sempre vem.
        const contact =
          value.contacts?.find(
            (c) =>
              (message.from_user_id && c.user_id === message.from_user_id) ||
              (message.from && c.wa_id === message.from)
          ) ?? (value.contacts?.length === 1 ? value.contacts[0] : undefined);
        const phone = message.from ? normalizePhone(message.from) : null;
        const userId = message.from_user_id ?? contact?.user_id ?? null;

        if (!phone && !userId) {
          console.error("[whatsapp webhook] Mensagem sem telefone e sem BSUID — ignorada", message.id);
          continue;
        }

        const contactName =
          contact?.profile?.name ?? contact?.profile?.username ?? phone ?? "Cliente WhatsApp";
        const content =
          message.text?.body ??
          (message.type !== "text" ? `[${message.type}]` : null);

        const client = await pool.connect();
        try {
          await client.query("begin");

          const clientId = await findOrCreateClient(client, { phone, userId, name: contactName });
          const conversationId = await upsertConversation(client, {
            clientId,
            phone,
            userId,
            initialStatus: "human_active",
          });

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
        await pool.query(
          `update whatsapp_messages
           set status = $1, raw_payload = coalesce(raw_payload, '{}'::jsonb) || $2::jsonb
           where whatsapp_message_id = $3`,
          [status.status, JSON.stringify({ last_status: status }), status.id]
        );
      }
    }
  }

}

type Identity = { phone: string | null; userId: string | null };

/** Acha a cliente pelo BSUID (preferência) ou telefone; cria se não existir.
 * Completa o dado que faltava (ex.: BSUID numa cliente antiga cadastrada só por telefone). */
async function findOrCreateClient(db: PoolClient, { phone, userId, name }: Identity & { name: string }) {
  const find = () =>
    db.query<{ id: string }>(
      `select id from clients
       where ($1::text is not null and wa_user_id = $1) or ($2::text is not null and phone = $2)
       order by (wa_user_id is not distinct from $1::text) desc
       limit 1`,
      [userId, phone]
    );

  let { rows } = await find();
  if (!rows[0]) {
    // "do nothing" cobre corrida entre duas entregas simultâneas do webhook.
    const inserted = await db.query<{ id: string }>(
      `insert into clients (full_name, phone, wa_user_id) values ($1, $2, $3)
       on conflict do nothing returning id`,
      [name, phone, userId]
    );
    if (inserted.rows[0]) return inserted.rows[0].id;
    ({ rows } = await find());
  }

  const id = rows[0].id;
  await db.query(
    `update clients set
       wa_user_id = coalesce(wa_user_id, $2::text),
       phone = coalesce(phone, case when not exists (select 1 from clients where phone = $3::text) then $3::text end)
     where id = $1`,
    [id, userId, phone]
  );
  return id;
}

async function upsertConversation(
  db: PoolClient,
  { clientId, phone, userId, initialStatus }: Identity & { clientId: string; initialStatus: string }
) {
  const find = () =>
    db.query<{ id: string }>(
      `select id from whatsapp_conversations
       where ($1::text is not null and wa_user_id = $1) or ($2::text is not null and phone_number = $2)
       order by (wa_user_id is not distinct from $1::text) desc
       limit 1`,
      [userId, phone]
    );

  let { rows } = await find();
  if (!rows[0]) {
    const inserted = await db.query<{ id: string }>(
      `insert into whatsapp_conversations
         (client_id, phone_number, wa_user_id, status, last_message_at, unread_count)
       values ($1, $2, $3, $4, now(), 1)
       on conflict do nothing returning id`,
      [clientId, phone, userId, initialStatus]
    );
    if (inserted.rows[0]) return inserted.rows[0].id;
    ({ rows } = await find());
  }

  const id = rows[0].id;
  await db.query(
    `update whatsapp_conversations set
       last_message_at = now(),
       unread_count = unread_count + 1,
       client_id = $2,
       wa_user_id = coalesce(wa_user_id, $3::text),
       phone_number = coalesce(phone_number,
         case when not exists (select 1 from whatsapp_conversations where phone_number = $4::text) then $4::text end)
     where id = $1`,
    [id, clientId, userId, phone]
  );
  return id;
}
