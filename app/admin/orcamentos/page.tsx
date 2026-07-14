import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuotes } from "@/lib/admin-data/quotes";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  sent: "outline",
  approved: "default",
  rejected: "destructive",
  expired: "outline",
};

const filters = [
  { label: "Todos", value: undefined },
  { label: "Pendentes", value: "pending" },
  { label: "Aprovados", value: "approved" },
  { label: "Recusados", value: "rejected" },
];

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const quotes = await getQuotes(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Orçamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe e responda aos orçamentos recebidos pelo site.
        </p>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/orcamentos?status=${f.value}` : "/admin/orcamentos"}
            className={cn(
              "rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors",
              status === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data do evento</TableHead>
              <TableHead>Pessoas</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recebido em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhum orçamento encontrado.
                </TableCell>
              </TableRow>
            )}
            {quotes.map((q) => (
              <TableRow key={q.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/admin/orcamentos/${q.id}`} className="block">
                    <p className="font-medium text-foreground">{q.client_name}</p>
                    <p className="text-xs text-muted-foreground">{q.client_phone}</p>
                  </Link>
                </TableCell>
                <TableCell>{formatDate(q.event_date)}</TableCell>
                <TableCell>{q.number_of_people}</TableCell>
                <TableCell>{q.total_value ? formatPrice(q.total_value) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[q.status] ?? "outline"}>
                    {statusLabels[q.status] ?? q.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(q.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
