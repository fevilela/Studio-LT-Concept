"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, getPool } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { localDateTimeToBrazilISO } from "@/lib/format";

const VALID_STATUSES = ["pending", "sent", "approved", "rejected", "expired"] as const;

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
  redirect("/admin/agenda");
}
