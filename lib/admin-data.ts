import { query } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentTeamMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { rows } = await query<{
    id: string;
    full_name: string;
    role: "admin" | "staff";
    job_title: string | null;
  }>(
    `select id, full_name, role, job_title from team_members where auth_user_id = $1`,
    [user.id]
  );

  return rows[0] ?? { id: null, full_name: user.email ?? "Equipe", role: "staff" as const, job_title: null };
}

export async function getDashboardStats() {
  const [pendingQuotes, upcomingAppointments, totalClients, unreadConversations] =
    await Promise.all([
      query<{ count: string }>(`select count(*) from quotes where status = 'pending'`),
      query<{ count: string }>(
        `select count(*) from appointments where start_time >= now() and status in ('scheduled', 'confirmed')`
      ),
      query<{ count: string }>(`select count(*) from clients`),
      query<{ count: string }>(
        `select count(*) from whatsapp_conversations where unread_count > 0`
      ),
    ]);

  return {
    pendingQuotes: Number(pendingQuotes.rows[0].count),
    upcomingAppointments: Number(upcomingAppointments.rows[0].count),
    totalClients: Number(totalClients.rows[0].count),
    unreadConversations: Number(unreadConversations.rows[0].count),
  };
}
