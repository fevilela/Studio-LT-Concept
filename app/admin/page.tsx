import Link from "next/link";
import { FileText, CalendarDays, Users, ArrowRight, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardStats, getCurrentTeamMember } from "@/lib/admin-data";
import { getRecentPendingQuotes, getUpcomingAppointments } from "@/lib/admin-data/dashboard";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [member, stats, recentQuotes, upcomingAppointments] = await Promise.all([
    getCurrentTeamMember(),
    getDashboardStats(),
    getRecentPendingQuotes(),
    getUpcomingAppointments(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Olá, {member?.full_name}!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui está um resumo do seu negócio hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orçamentos pendentes" value={stats.pendingQuotes} icon={FileText} />
        <StatCard
          label="Próximos agendamentos"
          value={stats.upcomingAppointments}
          icon={CalendarDays}
        />
        <StatCard label="Clientes cadastradas" value={stats.totalClients} icon={Users} />
        <StatCard
          label="Conversas não lidas"
          value={stats.unreadConversations}
          icon={MessageCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg">Orçamentos recentes</CardTitle>
            <Link
              href="/admin/orcamentos"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQuotes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum orçamento pendente.</p>
            )}
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/admin/orcamentos/${q.id}`}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium text-foreground">{q.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Evento em {formatDate(q.event_date)}
                  </p>
                </div>
                <p className="font-serif text-primary">
                  {q.total_value ? formatPrice(q.total_value) : "—"}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg">Próximos agendamentos</CardTitle>
            <Link
              href="/admin/agenda"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver agenda <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
            )}
            {upcomingAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{a.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.start_time)} · {a.team_member_name}
                  </p>
                </div>
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
