"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";

export async function sendManualReply(formData: FormData) {
  await requireAuth();

  const conversationId = String(formData.get("conversation_id"));
  const phoneNumber = String(formData.get("phone_number"));
  const content = String(formData.get("content") ?? "").trim();

  if (!conversationId || !phoneNumber || !content) {
    throw new Error("Escreva uma mensagem antes de enviar.");
  }

  const whatsappMessageId = await sendWhatsAppTextMessage(phoneNumber, content);

  await query(
    `insert into whatsapp_messages
       (conversation_id, direction, sender_type, content, message_type, whatsapp_message_id, status)
     values ($1, 'outbound', 'human', $2, 'text', $3, 'sent')`,
    [conversationId, content, whatsappMessageId ?? null]
  );

  await query(
    `update whatsapp_conversations
     set last_message_at = now(), status = 'human_active'
     where id = $1`,
    [conversationId]
  );

  revalidatePath(`/admin/conversas/${conversationId}`);
  revalidatePath("/admin/conversas");
}

export async function markConversationRead(conversationId: string) {
  await requireAuth();
  await query(`update whatsapp_conversations set unread_count = 0 where id = $1`, [
    conversationId,
  ]);
  revalidatePath("/admin/conversas");
}
