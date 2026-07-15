import { query } from "@/lib/db";

export type ClientListItem = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  created_at: string;
  quotes_count: string;
};

export type ClientFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getClients(filters: ClientFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(c.full_name ilike $${params.length} or c.phone ilike $${params.length} or c.cpf ilike $${params.length})`
    );
  }
  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    conditions.push(`c.created_at >= $${params.length}::date`);
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    conditions.push(`c.created_at < ($${params.length}::date + interval '1 day')`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const { rows } = await query<ClientListItem>(
    `select c.id, c.full_name, c.phone, c.email, c.cpf, c.created_at,
            count(q.id) as quotes_count
     from clients c
     left join quotes q on q.client_id = c.id
     ${where}
     group by c.id
     order by c.created_at desc`,
    params
  );
  return rows;
}

export type ClientDetail = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  notes: string | null;
  created_at: string;
};

export type ClientQuoteHistory = {
  id: string;
  event_date: string;
  total_value: string | null;
  status: string;
  created_at: string;
};

export type ClientAppointmentHistory = {
  id: string;
  start_time: string;
  status: string;
  team_member_name: string;
};

export async function getClientById(id: string) {
  const { rows } = await query<ClientDetail>(
    `select id, full_name, phone, email, cpf, notes, created_at from clients where id = $1`,
    [id]
  );
  if (rows.length === 0) return null;

  const { rows: quotes } = await query<ClientQuoteHistory>(
    `select id, event_date, total_value, status, created_at
     from quotes where client_id = $1 order by created_at desc`,
    [id]
  );

  const { rows: appointments } = await query<ClientAppointmentHistory>(
    `select a.id, a.start_time, a.status, t.full_name as team_member_name
     from appointments a
     join team_members t on t.id = a.team_member_id
     where a.client_id = $1 order by a.start_time desc`,
    [id]
  );

  return { client: rows[0], quotes, appointments };
}
