"use server";

import { revalidatePath } from "next/cache";
import { getPool, query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { localDateTimeToBrazilISO } from "@/lib/format";

export async function createAppointment(formData: FormData) {
  await requireAuth();

  const clientId = String(formData.get("client_id"));
  const teamMemberId = String(formData.get("team_member_id"));
  const startTimeRaw = String(formData.get("start_time"));
  const durationMinutes = Number(formData.get("duration_minutes")) || 120;
  const location = String(formData.get("location") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const startTime = startTimeRaw ? localDateTimeToBrazilISO(startTimeRaw) : "";

  if (!clientId || !teamMemberId || !startTime) {
    throw new Error("Preencha cliente, profissional e horário.");
  }

  const client = await getPool().connect();
  try {
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
      `insert into appointments (client_id, team_member_id, start_time, end_time, location, notes, status)
       values ($1, $2, $3::timestamptz, $3::timestamptz + ($4 || ' minutes')::interval, nullif($5, ''), nullif($6, ''), 'scheduled')`,
      [clientId, teamMemberId, startTime, durationMinutes, location, notes]
    );
  } finally {
    client.release();
  }

  revalidatePath("/admin/agenda");
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  await requireAuth();

  const valid = ["scheduled", "confirmed", "completed", "cancelled", "no_show"];
  if (!valid.includes(status)) throw new Error("Status inválido.");

  await query(`update appointments set status = $1 where id = $2`, [status, appointmentId]);
  revalidatePath("/admin/agenda");
}
