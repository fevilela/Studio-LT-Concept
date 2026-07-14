import { query } from "@/lib/db";

export type QuoteListItem = {
  id: string;
  client_name: string;
  client_phone: string;
  event_date: string;
  number_of_people: number;
  total_value: string | null;
  status: string;
  created_at: string;
};

export type QuoteDetail = QuoteListItem & {
  client_id: string;
  client_email: string | null;
  event_time: string | null;
  event_location: string | null;
  notes: string | null;
  created_by: string;
};

export type QuoteItemDetail = {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export async function getQuotes(status?: string) {
  const { rows } = await query<QuoteListItem>(
    `select q.id, c.full_name as client_name, c.phone as client_phone,
            q.event_date, q.number_of_people, q.total_value, q.status, q.created_at
     from quotes q
     join clients c on c.id = q.client_id
     where $1::quote_status is null or q.status = $1
     order by q.created_at desc`,
    [status ?? null]
  );
  return rows;
}

export async function getQuoteById(id: string) {
  const { rows } = await query<QuoteDetail>(
    `select q.id, q.client_id, c.full_name as client_name, c.phone as client_phone,
            c.email as client_email, q.event_date, q.event_time, q.event_location,
            q.number_of_people, q.total_value, q.status, q.notes, q.created_by, q.created_at
     from quotes q
     join clients c on c.id = q.client_id
     where q.id = $1`,
    [id]
  );
  if (rows.length === 0) return null;

  const { rows: items } = await query<QuoteItemDetail>(
    `select qi.id, coalesce(s.name, e.name) as name, qi.quantity, qi.unit_price, qi.subtotal
     from quote_items qi
     left join services s on s.id = qi.service_id
     left join extras e on e.id = qi.extra_id
     where qi.quote_id = $1`,
    [id]
  );

  return { quote: rows[0], items };
}
