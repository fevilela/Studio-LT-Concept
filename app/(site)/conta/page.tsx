import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { redirect } from "next/navigation";
import { Section, Eyebrow } from "@/components/site/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ensureClientProfile } from "@/lib/ensure-client-profile";
import { getMyQuotes, getMyAppointments } from "@/lib/client-data";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { CustomerLogoutButton } from "@/components/site/customer-logout-button";

export const metadata: Metadata = {
  title: "Minha Conta | Thainá Souza",
};

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Em análise",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
};

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/conta/entrar");

  const profile = await ensureClientProfile(user);
  if (!profile) {
    return (
      <Section className="pt-16">
        <Card className="mx-auto max-w-md">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Confirme seu e-mail para concluir o cadastro e acessar sua conta.
          </CardContent>
        </Card>
      </Section>
    );
  }

  const [quotes, appointments] = await Promise.all([
    getMyQuotes(profile.id),
    getMyAppointments(profile.id),
  ]);

  return (
    <Section className="pt-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Minha Conta</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl text-foreground">Olá, {profile.full_name}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acompanhe seus orçamentos e agendamentos por aqui.
          </p>
        </div>
        <CustomerLogoutButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-foreground">Meus orçamentos</h2>
            <Button size="sm" nativeButton={false} render={<Link href="/orcamento" />}>
              Novo orçamento
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Você ainda não fez nenhum orçamento.
              </p>
            )}
            {quotes.map((q) => (
              <Card key={q.id}>
                <CardContent className="space-y-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <Calendar className="size-4 text-primary" />
                      {formatDate(q.event_date)}
                    </span>
                    <Badge variant={q.status === "approved" ? "default" : "secondary"}>
                      {statusLabels[q.status] ?? q.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4" /> {q.number_of_people} pessoa(s)
                    </span>
                    <span className="font-serif text-primary">
                      {q.total_value ? formatPrice(q.total_value) : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-foreground">Meus agendamentos</h2>
          <div className="mt-4 space-y-3">
            {appointments.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento ainda.</p>
            )}
            {appointments.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <Clock className="size-4 text-primary" />
                      {formatDateTime(a.start_time)}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {a.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Com {a.team_member_name}</p>
                  {a.location && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4" /> {a.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
