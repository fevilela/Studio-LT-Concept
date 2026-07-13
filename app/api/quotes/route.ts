import { NextResponse } from "next/server";
import { query, getPool } from "@/lib/db";
import { quoteFormSchema } from "@/lib/validations/quote";

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

type ServiceRow = { id: string; name: string; base_price: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const phone = normalizePhone(data.phone);

  const { rows: servicesRows } = await query<ServiceRow>(
    `select id, name, base_price from services where id = any($1::uuid[]) and active = true`,
    [data.service_ids]
  );

  if (servicesRows.length === 0) {
    return NextResponse.json(
      { error: "Nenhum serviço válido foi selecionado." },
      { status: 400 }
    );
  }

  const totalValue = servicesRows.reduce((sum, s) => sum + Number(s.base_price), 0);

  const client = await getPool().connect();
  try {
    await client.query("begin");

    const { rows: clientRows } = await client.query<{ id: string }>(
      `insert into clients (full_name, phone, email)
       values ($1, $2, nullif($3, ''))
       on conflict (phone) do update
         set full_name = excluded.full_name,
             email = coalesce(excluded.email, clients.email)
       returning id`,
      [data.full_name, phone, data.email ?? ""]
    );
    const clientId = clientRows[0].id;

    const { rows: quoteRows } = await client.query<{ id: string }>(
      `insert into quotes
         (client_id, event_date, event_time, event_location, number_of_people, total_value, notes, created_by)
       values ($1, $2, nullif($3, '')::time, nullif($4, ''), $5, $6, nullif($7, ''), 'public_form')
       returning id`,
      [
        clientId,
        data.event_date,
        data.event_time ?? "",
        data.event_location ?? "",
        data.number_of_people,
        totalValue,
        data.notes ?? "",
      ]
    );
    const quoteId = quoteRows[0].id;

    for (const service of servicesRows) {
      await client.query(
        `insert into quote_items (quote_id, service_id, quantity, unit_price, subtotal)
         values ($1, $2, 1, $3, $3)`,
        [quoteId, service.id, service.base_price]
      );
    }

    await client.query("commit");

    return NextResponse.json({ success: true, quoteId, total: totalValue });
  } catch (err) {
    await client.query("rollback");
    console.error("Failed to create quote", err);
    return NextResponse.json(
      { error: "Não foi possível registrar o orçamento. Tente novamente." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
