import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/admin-data/clients";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getClientById(id);
  if (!result) notFound();
  const { client, quotes, appointments } = result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">{client.full_name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Phone className="size-4 text-primary" /> {client.phone}
          </span>
          {client.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="size-4 text-primary" /> {client.email}
            </span>
          )}
          <span>Cliente desde {formatDate(client.created_at)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Orçamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum orçamento.</p>
            )}
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/admin/orcamentos/${q.id}`}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm transition-colors hover:bg-accent"
              >
                <span>Evento em {formatDate(q.event_date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {q.total_value ? formatPrice(q.total_value) : "—"}
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {q.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointments.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
            )}
            {appointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
              >
                <span>
                  {formatDateTime(a.start_time)} · {a.team_member_name}
                </span>
                <Badge variant="secondary" className="capitalize">
                  {a.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
