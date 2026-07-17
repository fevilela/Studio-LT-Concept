import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getConversations } from "@/lib/admin-data/conversations";
import { formatDateTime } from "@/lib/format";
import { AutoRefresh } from "@/components/admin/auto-refresh";

export const dynamic = "force-dynamic";

export default async function ConversasPage() {
  const conversations = await getConversations();

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <div>
        <h1 className="font-serif text-3xl text-foreground">Conversas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mensagens do WhatsApp recebidas pelo site.
        </p>
      </div>

      {conversations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <MessageCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma conversa ainda. Assim que o WhatsApp Business estiver conectado, as
              mensagens das noivas aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-1.5">
        {conversations.map((c) => (
          <Link
            key={c.id}
            href={`/admin/conversas/${c.id}`}
            className="flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-border/60 bg-card px-3 py-2 transition-colors hover:bg-accent"
          >
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                  {c.client_name ?? c.phone_number}
                </p>
                {c.unread_count > 0 && (
                  <Badge className="h-4 min-w-4 shrink-0 justify-center px-1 text-[10px]">
                    {c.unread_count}
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.last_message_preview ?? "Sem mensagens"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span className="text-[10px] text-muted-foreground">
                {c.last_message_at ? formatDateTime(c.last_message_at) : ""}
              </span>
              <Badge
                variant={c.status === "human_active" ? "default" : "secondary"}
                className="text-[10px]"
              >
                {c.status === "bot_active" ? "Bot" : c.status === "closed" ? "Fechada" : "Atendendo"}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
