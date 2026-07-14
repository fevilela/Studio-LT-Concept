import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getConversationById } from "@/lib/admin-data/conversations";
import { formatDateTime } from "@/lib/format";
import { ConversationReplyForm } from "@/components/admin/conversation-reply-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const senderLabels: Record<string, string> = {
  client: "",
  bot: "Bot",
  human: "Equipe",
  system: "Sistema",
};

export default async function ConversationThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getConversationById(id);
  if (!result) notFound();
  const { conversation, messages } = result;

  await query(`update whatsapp_conversations set unread_count = 0 where id = $1`, [id]);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="border-b border-border/60 pb-4">
        <h1 className="font-serif text-2xl text-foreground">
          {conversation.client_name ?? conversation.phone_number}
        </h1>
        <p className="text-sm text-muted-foreground">{conversation.phone_number}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma mensagem nesta conversa ainda.
          </p>
        )}
        {messages.map((m) => {
          const isInbound = m.direction === "inbound";
          return (
            <div key={m.id} className={cn("flex", isInbound ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                  isInbound
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {senderLabels[m.sender_type] && (
                  <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider opacity-70">
                    {senderLabels[m.sender_type]}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-[10px] opacity-60">{formatDateTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border/60 pt-4">
        <ConversationReplyForm conversationId={conversation.id} phoneNumber={conversation.phone_number} />
      </div>
    </div>
  );
}
