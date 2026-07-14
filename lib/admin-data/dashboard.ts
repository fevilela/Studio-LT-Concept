import { query } from "@/lib/db";

export type RecentQuote = {
  id: string;
  client_name: string;
  event_date: string;
  total_value: string | null;
  status: string;
  created_at: string;
};

export type UpcomingAppointment = {
  id: string;
  client_name: string;
  team_member_name: string;
  start_time: string;
  status: string;
};

export async function getRecentPendingQuotes() {
  const { rows } = await query<RecentQuote>(
    `select q.id, c.full_name as client_name, q.event_date, q.total_value, q.status, q.created_at
     from quotes q
     join clients c on c.id = q.client_id
     where q.status = 'pending'
     order by q.created_at desc
     limit 5`
  );
  return rows;
}

export async function getUpcomingAppointments() {
  const { rows } = await query<UpcomingAppointment>(
    `select a.id, c.full_name as client_name, t.full_name as team_member_name,
            a.start_time, a.status
     from appointments a
     join clients c on c.id = a.client_id
     join team_members t on t.id = a.team_member_id
     where a.start_time >= now() and a.status in ('scheduled', 'confirmed')
     order by a.start_time asc
     limit 5`
  );
  return rows;
}
