"use server";

import { revalidatePath } from "next/cache";
import { query, getPool } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { localDateTimeToBrazilISO } from "@/lib/format";
import { sendReactivationTemplateMessage } from "@/lib/whatsapp/client";

const VALID_STATUSES = ["pending", "sent", "approved", "rejected", "expired"] as const;

/**
 * Garante que exista uma conversa de WhatsApp para este cliente e retorna o id,
 * para o botão "Iniciar conversa" abrir a aba Conversas em vez de sair do sistema.
 * Se a cliente nunca mandou mensagem, tenta enviar o template de primeiro contato
 * (WHATSAPP_QUOTE_CONTACT_TEMPLATE_NAME) — só funciona depois de aprovado pela Meta;
 * enquanto isso, falha silenciosamente e a equipe só vê a conversa vazia.
 */
export async function getOrCreateConversationForClient(
  clientId: string,
  clientPhone: string,
  clientFirstName: string
) {
  await requireAuth();

  const { rows } = await query<{ id: string }>(
    `insert into whatsapp_conversations (client_id, phone_number, status)
     values ($1, $2, 'human_active')
     on conflict (phone_number) do update set client_id = excluded.client_id
     returning id`,
    [clientId, clientPhone]
  );
  const conversationId = rows[0].id;

  const { rows: existingMessages } = await query<{ id: string }>(
    `select id from whatsapp_messages where conversation_id = $1 limit 1`,
    [conversationId]
  );

  if (existingMessages.length === 0) {
    try {
      const { messageId, content } = await sendReactivationTemplateMessage(
        clientPhone,
        clientFirstName
      );
      await query(
        `insert into whatsapp_messages
           (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, status)
         values ($1, 'outbound', 'human', $2, 'template', $3, 'sent')`,
        [conversationId, content, messageId ?? null]
      );
      await query(`update whatsapp_conversations set last_message_at = now() where id = $1`, [
        conversationId,
      ]);
    } catch (err) {
      console.error("[quotes] Failed to send first-contact template", err);
    }
  }

  return conversationId;
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  await requireAuth();

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error("Status inválido.");
  }

  await query(`update quotes set status = $1 where id = $2`, [status, quoteId]);
  revalidatePath("/admin/orcamentos");
  revalidatePath(`/admin/orcamentos/${quoteId}`);
}

export async function convertQuoteToAppointment(formData: FormData) {
  await requireAuth();

  const quoteId = String(formData.get("quote_id"));
  const clientId = String(formData.get("client_id"));
  const teamMemberId = String(formData.get("team_member_id"));
  const startTimeRaw = String(formData.get("start_time"));
  const location = String(formData.get("location") ?? "");

  const startTime = startTimeRaw ? localDateTimeToBrazilISO(startTimeRaw) : "";

  if (!quoteId || !clientId || !teamMemberId || !startTime) {
    throw new Error("Preencha todos os campos para agendar.");
  }

  const { rows: durationRows } = await query<{ total_minutes: string | null }>(
    `select sum(s.duration_minutes * qi.quantity) as total_minutes
     from quote_items qi
     join services s on s.id = qi.service_id
     where qi.quote_id = $1`,
    [quoteId]
  );
  const durationMinutes = Number(durationRows[0]?.total_minutes) || 120;

  const client = await getPool().connect();
  try {
    await client.query("begin");

    const conflict = await client.query(
      `select id from appointments
       where team_member_id = $1
         and status not in ('cancelled')
         and tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $2::timestamptz + ($3 || ' minutes')::interval)`,
      [teamMemberId, startTime, durationMinutes]
    );

    if (conflict.rows.length > 0) {
      throw new Error("Esse profissional já tem um compromisso nesse horário.");
    }

    await client.query(
      `insert into appointments (quote_id, client_id, team_member_id, start_time, end_time, location, status)
       values ($1, $2, $3, $4::timestamptz, $4::timestamptz + ($5 || ' minutes')::interval, nullif($6, ''), 'scheduled')`,
      [quoteId, clientId, teamMemberId, startTime, durationMinutes, location]
    );

    await client.query(`update quotes set status = 'approved' where id = $1`, [quoteId]);

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }

  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin/agenda");
}
