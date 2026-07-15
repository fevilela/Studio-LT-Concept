import { query } from "@/lib/db";

export type MyQuote = {
  id: string;
  event_date: string;
  event_time: string | null;
  number_of_people: number;
  total_value: string | null;
  status: string;
  created_at: string;
};

export type MyAppointment = {
  id: string;
  start_time: string;
  status: string;
  team_member_name: string;
  location: string | null;
};

export async function getMyQuotes(clientId: string) {
  const { rows } = await query<MyQuote>(
    `select id, event_date, event_time, number_of_people, total_value, status, created_at
     from quotes where client_id = $1 order by created_at desc`,
    [clientId]
  );
  return rows;
}

export async function getMyAppointments(clientId: string) {
  const { rows } = await query<MyAppointment>(
    `select a.id, a.start_time, a.status, t.full_name as team_member_name, a.location
     from appointments a
     join team_members t on t.id = a.team_member_id
     where a.client_id = $1
     order by a.start_time desc`,
    [clientId]
  );
  return rows;
}
