import { query } from "@/lib/db";
import type { WhatsAppRecipient } from "@/lib/whatsapp/client";

/** Busca no banco para quem enviar numa conversa (telefone e/ou BSUID). Sempre
 * a partir do id da conversa — nunca confiar em telefone vindo do navegador. */
export async function getConversationRecipient(conversationId: string): Promise<WhatsAppRecipient> {
  const { rows } = await query<{ phone_number: string | null; wa_user_id: string | null }>(
    `select phone_number, wa_user_id from whatsapp_conversations where id = $1`,
    [conversationId]
  );
  if (!rows[0]) throw new Error("Conversa não encontrada.");
  return { phone: rows[0].phone_number, userId: rows[0].wa_user_id };
}
