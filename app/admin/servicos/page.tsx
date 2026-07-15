import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllServices } from "@/lib/admin-data/services";
import { formatPrice } from "@/lib/format";
import { ServiceDialog } from "@/components/admin/service-dialog";
import { ServiceActiveToggle } from "@/components/admin/service-active-toggle";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  maquiagem: "Maquiagem",
  penteado: "Penteado",
  cerimonia: "Cerimônia",
  pacote: "Pacote Completo",
};

export default async function ServicosPage() {
  const services = await getAllServices();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Serviços</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Serviços e preços exibidos no site e usados nos orçamentos.
          </p>
        </div>
        <ServiceDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categoryLabels[s.category] ?? s.category}
                </TableCell>
                <TableCell>{formatPrice(s.base_price)}</TableCell>
                <TableCell className="text-muted-foreground">{s.duration_minutes} min</TableCell>
                <TableCell>
                  <ServiceActiveToggle id={s.id} active={s.active} />
                </TableCell>
                <TableCell className="text-right">
                  <ServiceDialog service={s} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
