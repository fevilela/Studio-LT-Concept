import { query } from "@/lib/db";

export type AppointmentListItem = {
  id: string;
  client_name: string;
  client_phone: string;
  team_member_name: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string | null;
};

export async function getAppointments() {
  const { rows } = await query<AppointmentListItem>(
    `select a.id, c.full_name as client_name, c.phone as client_phone,
            t.full_name as team_member_name, a.start_time, a.end_time, a.status, a.location
     from appointments a
     join clients c on c.id = a.client_id
     join team_members t on t.id = a.team_member_id
     where a.start_time >= now() - interval '1 day'
     order by a.start_time asc`
  );
  return rows;
}
