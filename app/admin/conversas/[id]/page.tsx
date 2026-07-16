import Link from "next/link";
import { notFound } from "next/navigation";
import { Wrench, AlertTriangle, FileText, Calendar, Users } from "lucide-react";
import { query } from "@/lib/db";
import { getConversationById } from "@/lib/admin-data/conversations";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { ConversationReplyForm } from "@/components/admin/conversation-reply-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AutoRefresh } from "@/components/admin/auto-refresh";

export const dynamic = "force-dynamic";

const senderLabels: Record<string, string> = {
  client: "",
  bot: "Bot",
  human: "Equipe",
  system: "Sistema",
};

const statusLabels: Record<string, string> = {
  bot_active: "Bot respondendo",
  human_active: "Atendendo",
  closed: "Fechada",
};

const quoteStatusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
};

export default async function ConversationThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getConversationById(id);
  if (!result) notFound();
  const { conversation, messages, toolCalls, quotes } = result;

  await query(`update whatsapp_conversations set unread_count = 0 where id = $1`, [id]);

  const hasInboundMessage = messages.some((m) => m.direction === "inbound");

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-6 sm:h-[calc(100vh-6rem)]">
      <AutoRefresh />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h1 className="font-serif text-2xl text-foreground">
              {conversation.client_name ?? conversation.phone_number}
            </h1>
            <p className="text-sm text-muted-foreground">{conversation.phone_number}</p>
          </div>
          <Badge variant={conversation.status === "bot_active" ? "secondary" : "default"}>
            {statusLabels[conversation.status] ?? conversation.status}
          </Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma mensagem nesta conversa ainda.
            </p>
          )}
          {messages.map((m) => {
            const isInbound = m.direction === "inbound";
            const error = m.status === "failed" ? m.raw_payload?.last_status?.errors?.[0] : undefined;
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
                  {m.status === "failed" && (
                    <p className="mt-1 flex items-start gap-1 text-[10px] text-destructive">
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      {error
                        ? `Falhou (${error.code}): ${error.title ?? error.message ?? "erro desconhecido"}`
                        : "Falhou ao entregar."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border/60 pt-4">
          {!hasInboundMessage && (
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-accent/60 p-3 text-xs text-accent-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <p>
                Essa cliente ainda não mandou nenhuma mensagem por aqui. A Meta só permite a
                empresa enviar a primeira mensagem através de um modelo aprovado (ainda não
                configurado) — por enquanto, é preciso que ela mande uma mensagem primeiro (ou
                fale com ela por outro canal e peça pra ela chamar no WhatsApp) antes de
                responder por aqui.
              </p>
            </div>
          )}
          <ConversationReplyForm
            conversationId={conversation.id}
            phoneNumber={conversation.phone_number}
          />
        </div>
      </div>

      {(quotes.length > 0 || toolCalls.length > 0) && (
        <aside className="hidden w-80 shrink-0 space-y-6 overflow-y-auto border-l border-border/60 pl-6 lg:block">
          {quotes.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3.5" /> Orçamento{quotes.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-3">
                {quotes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/orcamentos/${q.id}`}
                    className="block rounded-lg border border-border/60 bg-card p-3 text-xs transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3.5 text-primary" /> {formatDate(q.event_date)}
                      </span>
                      <Badge variant="secondary">{quoteStatusLabels[q.status] ?? q.status}</Badge>
                    </div>
                    {q.service_names && (
                      <p className="mt-2 text-muted-foreground">{q.service_names}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" /> {q.number_of_people} pessoa(s)
                      </span>
                      <span className="font-serif text-sm text-primary">
                        {q.total_value ? formatPrice(q.total_value) : "—"}
                      </span>
                    </div>
                    {q.event_location && (
                      <p className="mt-1 truncate text-muted-foreground">{q.event_location}</p>
                    )}
                    {q.notes && (
                      <p className="mt-2 border-t border-border/60 pt-2 text-muted-foreground">
                        {q.notes}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {toolCalls.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Wrench className="size-3.5" /> O que o bot fez
              </p>
              <div className="space-y-2">
                {toolCalls.map((t) => (
                  <div key={t.id} className="rounded-lg border border-border/60 bg-card p-3 text-xs">
                    <p className="font-medium text-foreground">{t.tool_name}</p>
                    <p className="mt-1 text-muted-foreground">{formatDateTime(t.created_at)}</p>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[10px] text-muted-foreground">
                      {JSON.stringify(t.output, null, 1)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
