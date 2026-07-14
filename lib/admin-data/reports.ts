import { query } from "@/lib/db";

export type QuoteStatusBreakdown = { status: string; count: string; total_value: string | null };

export async function getQuoteStatusBreakdown() {
  const { rows } = await query<QuoteStatusBreakdown>(
    `select status, count(*) as count, sum(total_value) as total_value
     from quotes group by status order by status`
  );
  return rows;
}

export type TeamOccupancy = {
  team_member_name: string;
  appointments_count: string;
  hours_booked: string | null;
};

export async function getTeamOccupancy() {
  const { rows } = await query<TeamOccupancy>(
    `select t.full_name as team_member_name,
            count(a.id) as appointments_count,
            round(sum(extract(epoch from (a.end_time - a.start_time)) / 3600)::numeric, 1) as hours_booked
     from team_members t
     left join appointments a on a.team_member_id = t.id
       and a.status not in ('cancelled')
       and a.start_time >= now() - interval '30 days'
     where t.active = true
     group by t.id, t.full_name
     order by appointments_count desc`
  );
  return rows;
}

export async function getConversionRate() {
  const { rows } = await query<{ total: string; approved: string }>(
    `select count(*) as total, count(*) filter (where status = 'approved') as approved from quotes`
  );
  const total = Number(rows[0].total);
  const approved = Number(rows[0].approved);
  return { total, approved, rate: total > 0 ? Math.round((approved / total) * 100) : 0 };
}
