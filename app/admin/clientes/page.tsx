import Link from "next/link";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getClients } from "@/lib/admin-data/clients";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const { q, from, to } = await searchParams;
  const clients = await getClients({ search: q, dateFrom: from, dateTo: to });
  const hasFilters = Boolean(q || from || to);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas as noivas que já entraram em contato.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">Nome, telefone ou CPF</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Buscar..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">Cliente desde</Label>
          <Input id="from" name="from" type="date" defaultValue={from} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Até</Label>
          <Input id="to" name="to" type="date" defaultValue={to} />
        </div>
        <Button type="submit" size="sm">
          <Search className="size-4" /> Filtrar
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/clientes" />}>
            Limpar
          </Button>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Orçamentos</TableHead>
              <TableHead>Desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Nenhuma cliente encontrada.
                </TableCell>
              </TableRow>
            )}
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/admin/clientes/${c.id}`} className="font-medium text-foreground hover:text-primary">
                    {c.full_name}
                  </Link>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{c.cpf ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                <TableCell>{c.quotes_count}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
