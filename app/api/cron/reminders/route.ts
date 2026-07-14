import { query } from "@/lib/db";
import { sendWhatsAppTemplateMessage } from "@/lib/whatsapp/client";
import { formatDateTime } from "@/lib/format";

type AppointmentDue = {
  id: string;
  client_name: string;
  client_phone: string;
  start_time: string;
};

// Executado periodicamente por um Cron Job do Render (ver render.yaml), que
// chama esta rota via HTTP. Envia lembrete de agendamento ~24h antes via
// template aprovado da Meta — só funciona depois que
// WHATSAPP_REMINDER_TEMPLATE_NAME estiver configurado e o template aprovado.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const templateName = process.env.WHATSAPP_REMINDER_TEMPLATE_NAME;
  if (!templateName) {
    return Response.json({
      skipped: true,
      reason: "WHATSAPP_REMINDER_TEMPLATE_NAME não configurado ainda.",
    });
  }

  const { rows: dueAppointments } = await query<AppointmentDue>(
    `select a.id, c.full_name as client_name, c.phone as client_phone, a.start_time
     from appointments a
     join clients c on c.id = a.client_id
     where a.status in ('scheduled', 'confirmed')
       and a.reminder_sent_at is null
       and a.start_time between now() + interval '23 hours' and now() + interval '25 hours'`
  );

  const results = [];
  for (const appt of dueAppointments) {
    try {
      await sendWhatsAppTemplateMessage(appt.client_phone, templateName, "pt_BR", [
        appt.client_name,
        formatDateTime(appt.start_time),
      ]);
      await query(`update appointments set reminder_sent_at = now() where id = $1`, [appt.id]);
      results.push({ id: appt.id, sent: true });
    } catch (err) {
      console.error("[cron reminders] Failed to send reminder", appt.id, err);
      results.push({ id: appt.id, sent: false });
    }
  }

  return Response.json({ processed: results.length, results });
}
