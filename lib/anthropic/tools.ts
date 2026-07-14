import type Anthropic from "@anthropic-ai/sdk";
import { query, getPool } from "@/lib/db";
import { localDateTimeToBrazilISO } from "@/lib/format";

// Studio LT Concept atende Terça a sexta, 13h às 18h (horário de Lavras-MG).
const BUSINESS_WEEKDAYS = [2, 3, 4, 5]; // 0=domingo ... 2=terça, 5=sexta
const BUSINESS_START_HOUR = 13;
const BUSINESS_END_HOUR = 18;

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "get_services_info",
    description:
      "Retorna a lista de serviços ativos oferecidos pelo Studio LT Concept, com preço e duração de cada um.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "check_availability",
    description:
      "Verifica horários disponíveis em uma data específica. Atendimento é apenas de terça a sexta, das 13h às 18h.",
    input_schema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Data desejada no formato YYYY-MM-DD.",
        },
        team_member_name: {
          type: "string",
          description:
            "Nome do profissional (opcional). Se não informado, verifica todos os profissionais.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "create_quote",
    description:
      "Registra um orçamento para a cliente, a partir dos serviços, data do evento e dados de contato já confirmados na conversa.",
    input_schema: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Nome completo da cliente." },
        event_date: { type: "string", description: "Data do evento no formato YYYY-MM-DD." },
        number_of_people: { type: "integer", description: "Número de pessoas no atendimento." },
        service_names: {
          type: "array",
          items: { type: "string" },
          description: "Nomes dos serviços desejados, exatamente como retornados por get_services_info.",
        },
        notes: { type: "string", description: "Observações adicionais (opcional)." },
      },
      required: ["client_name", "event_date", "number_of_people", "service_names"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Transfere a conversa para um atendente humano. Use quando a cliente pedir explicitamente, reclamar, negociar valores fora da tabela, ou quando você não tiver certeza de como ajudar.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Motivo breve do encaminhamento." },
      },
      required: ["reason"],
    },
  },
];

type ToolContext = {
  conversationId: string;
  clientPhone: string;
};

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<{ output: unknown; escalated?: boolean }> {
  switch (name) {
    case "get_services_info":
      return { output: await getServicesInfo() };
    case "check_availability":
      return { output: await checkAvailability(input.date as string, input.team_member_name as string | undefined) };
    case "create_quote":
      return { output: await createQuoteFromBot(input, ctx) };
    case "escalate_to_human":
      return { output: await escalateToHuman(input.reason as string, ctx), escalated: true };
    default:
      return { output: { error: `Ferramenta desconhecida: ${name}` } };
  }
}

async function getServicesInfo() {
  const { rows } = await query(
    `select name, category, description, base_price, duration_minutes
     from services where active = true order by display_order asc`
  );
  return rows;
}

async function checkAvailability(dateStr: string, teamMemberName?: string) {
  const date = new Date(`${dateStr}T12:00:00-03:00`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Data inválida. Use o formato YYYY-MM-DD." };
  }

  const weekday = date.getUTCDay();
  if (!BUSINESS_WEEKDAYS.includes(weekday)) {
    return { available: false, reason: "Só atendemos de terça a sexta-feira." };
  }

  const { rows: members } = await query<{ id: string; full_name: string }>(
    `select id, full_name from team_members where active = true` +
      (teamMemberName ? ` and full_name ilike $1` : ``),
    teamMemberName ? [`%${teamMemberName}%`] : []
  );

  if (members.length === 0) {
    return { available: false, reason: "Profissional não encontrado." };
  }

  const dayStart = localDateTimeToBrazilISO(`${dateStr}T00:00`);
  const dayEnd = localDateTimeToBrazilISO(`${dateStr}T23:59`);

  const { rows: busy } = await query<{ team_member_id: string; start_time: string; end_time: string }>(
    `select team_member_id, start_time, end_time from appointments
     where start_time < $2::timestamptz and end_time > $1::timestamptz and status not in ('cancelled')
     union all
     select team_member_id, start_time, end_time from availability_blocks
     where start_time < $2::timestamptz and end_time > $1::timestamptz`,
    [dayStart, dayEnd]
  );

  const slots: { time: string; available_with: string[] }[] = [];
  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    const slotStart = new Date(localDateTimeToBrazilISO(`${dateStr}T${String(hour).padStart(2, "0")}:00`));
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

    const availableMembers = members.filter((m) => {
      return !busy.some((b) => {
        if (b.team_member_id !== m.id) return false;
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        return slotStart < bEnd && slotEnd > bStart;
      });
    });

    if (availableMembers.length > 0) {
      slots.push({
        time: `${String(hour).padStart(2, "0")}:00`,
        available_with: availableMembers.map((m) => m.full_name),
      });
    }
  }

  return { available: slots.length > 0, slots };
}

async function createQuoteFromBot(
  input: Record<string, unknown>,
  ctx: ToolContext
) {
  const clientName = String(input.client_name ?? "").trim();
  const eventDate = String(input.event_date ?? "");
  const numberOfPeople = Number(input.number_of_people) || 1;
  const serviceNames = Array.isArray(input.service_names) ? (input.service_names as string[]) : [];
  const notes = String(input.notes ?? "");

  if (!clientName || !eventDate || serviceNames.length === 0) {
    return { error: "Faltam dados para criar o orçamento (nome, data ou serviços)." };
  }

  const { rows: services } = await query<{ id: string; name: string; base_price: string }>(
    `select id, name, base_price from services where active = true and name = any($1::text[])`,
    [serviceNames]
  );

  if (services.length === 0) {
    return { error: "Nenhum dos serviços informados foi encontrado." };
  }

  const total = services.reduce((sum, s) => sum + Number(s.base_price), 0);

  const client = await getPool().connect();
  try {
    await client.query("begin");

    const { rows: clientRows } = await client.query<{ id: string }>(
      `insert into clients (full_name, phone)
       values ($1, $2)
       on conflict (phone) do update set full_name = excluded.full_name
       returning id`,
      [clientName, ctx.clientPhone]
    );
    const clientId = clientRows[0].id;

    const { rows: quoteRows } = await client.query<{ id: string }>(
      `insert into quotes (client_id, event_date, number_of_people, total_value, notes, created_by)
       values ($1, $2, $3, $4, nullif($5, ''), 'bot')
       returning id`,
      [clientId, eventDate, numberOfPeople, total, notes]
    );
    const quoteId = quoteRows[0].id;

    for (const service of services) {
      await client.query(
        `insert into quote_items (quote_id, service_id, quantity, unit_price, subtotal)
         values ($1, $2, 1, $3, $3)`,
        [quoteId, service.id, service.base_price]
      );
    }

    await client.query("commit");

    return {
      quote_id: quoteId,
      total_value: total,
      services: services.map((s) => s.name),
    };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function escalateToHuman(reason: string, ctx: ToolContext) {
  await query(
    `update whatsapp_conversations set status = 'human_active' where id = $1`,
    [ctx.conversationId]
  );
  return { escalated: true, reason: reason || "Solicitado pela cliente." };
}
