import { TrendingUp, Users2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import {
  getQuoteStatusBreakdown,
  getTeamOccupancy,
  getConversionRate,
} from "@/lib/admin-data/reports";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
};

export default async function RelatoriosPage() {
  const [breakdown, occupancy, conversion] = await Promise.all([
    getQuoteStatusBreakdown(),
    getTeamOccupancy(),
    getConversionRate(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral de orçamentos e ocupação da equipe.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Taxa de conversão" value={`${conversion.rate}%`} icon={TrendingUp} />
        <StatCard label="Orçamentos aprovados" value={conversion.approved} icon={FileText} />
        <StatCard label="Total de orçamentos" value={conversion.total} icon={Users2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Orçamentos por status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {breakdown.map((b) => (
              <div
                key={b.status}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
              >
                <span className="capitalize text-foreground">
                  {statusLabels[b.status] ?? b.status}
                </span>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{b.count}</span>
                  <span>{b.total_value ? formatPrice(b.total_value) : "—"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Ocupação da equipe (últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {occupancy.map((o) => (
              <div
                key={o.team_member_name}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
              >
                <span className="text-foreground">{o.team_member_name}</span>
                <span className="text-muted-foreground">
                  {o.appointments_count} atendimento(s) · {o.hours_booked ?? 0}h
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
