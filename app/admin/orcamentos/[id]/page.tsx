import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuoteById } from "@/lib/admin-data/quotes";
import { getTeamMembers } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { QuoteStatusActions } from "@/components/admin/quote-status-actions";
import { ConvertToAppointmentForm } from "@/components/admin/convert-to-appointment-form";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, teamMembers] = await Promise.all([getQuoteById(id), getTeamMembers()]);

  if (!result) notFound();
  const { quote, items } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">{quote.client_name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{statusLabels[quote.status] ?? quote.status}</Badge>
            <span className="text-xs text-muted-foreground">
              Recebido em {formatDate(quote.created_at)}
            </span>
          </div>
        </div>
        <QuoteStatusActions quoteId={quote.id} status={quote.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Detalhes do evento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 text-primary" />
                {formatDate(quote.event_date)}
              </p>
              {quote.event_time && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-primary" />
                  {quote.event_time}
                </p>
              )}
              <p className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4 text-primary" />
                {quote.number_of_people} pessoa(s)
              </p>
              {quote.event_location && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  {quote.event_location}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Serviços solicitados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                  </span>
                  <span className="text-muted-foreground">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 font-serif text-lg text-primary">
                <span>Total</span>
                <span>{quote.total_value ? formatPrice(quote.total_value) : "—"}</span>
              </div>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                {quote.client_phone}
              </p>
              {quote.client_email && (
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  {quote.client_email}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Agendar atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ConvertToAppointmentForm
                quoteId={quote.id}
                clientId={quote.client_id}
                teamMembers={teamMembers.map((t) => ({ id: t.id, full_name: t.full_name }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
