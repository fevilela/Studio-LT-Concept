import { query } from "@/lib/db";

export type ConversationListItem = {
  id: string;
  client_name: string;
  phone_number: string;
  status: string;
  last_message_at: string | null;
  unread_count: number;
  last_message_preview: string | null;
};

export async function getConversations() {
  const { rows } = await query<ConversationListItem>(
    `select c.id, cl.full_name as client_name, c.phone_number, c.status,
            c.last_message_at, c.unread_count,
            (select content from whatsapp_messages m
             where m.conversation_id = c.id
             order by m.created_at desc limit 1) as last_message_preview
     from whatsapp_conversations c
     left join clients cl on cl.id = c.client_id
     order by c.last_message_at desc nulls last`
  );
  return rows;
}

export type ConversationMessage = {
  id: string;
  direction: "inbound" | "outbound";
  sender_type: string;
  content: string | null;
  message_type: string;
  status: string;
  created_at: string;
};

export async function getConversationById(id: string) {
  const { rows } = await query<ConversationListItem & { client_id: string | null }>(
    `select c.id, c.client_id, cl.full_name as client_name, c.phone_number, c.status,
            c.last_message_at, c.unread_count, null as last_message_preview
     from whatsapp_conversations c
     left join clients cl on cl.id = c.client_id
     where c.id = $1`,
    [id]
  );
  if (rows.length === 0) return null;

  const { rows: messages } = await query<ConversationMessage>(
    `select id, direction, sender_type, content, message_type, status, created_at
     from whatsapp_messages
     where conversation_id = $1
     order by created_at asc`,
    [id]
  );

  const { rows: toolCalls } = await query<BotToolCall>(
    `select id, tool_name, input, output, created_at
     from bot_tool_calls
     where conversation_id = $1
     order by created_at asc`,
    [id]
  );

  return { conversation: rows[0], messages, toolCalls };
}

export type BotToolCall = {
  id: string;
  tool_name: string;
  input: unknown;
  output: unknown;
  created_at: string;
};
