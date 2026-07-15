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
import { getAllTeamMembers } from "@/lib/admin-data/team";
import { TeamMemberDialog } from "@/components/admin/team-member-dialog";
import { TeamMemberActiveToggle } from "@/components/admin/team-member-active-toggle";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = { admin: "Administradora", staff: "Equipe" };

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const team = await getAllTeamMembers(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Equipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Profissionais exibidas no site e disponíveis na agenda.
          </p>
        </div>
        <TeamMemberDialog />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">Nome ou cargo</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Buscar..." />
        </div>
        <Button type="submit" size="sm">
          <Search className="size-4" /> Filtrar
        </Button>
        {q && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/equipe" />}>
            Limpar
          </Button>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-foreground">{member.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{member.job_title ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {roleLabels[member.role]}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.instagram_handle ? `@${member.instagram_handle}` : "—"}
                </TableCell>
                <TableCell>
                  <TeamMemberActiveToggle id={member.id} active={member.active} />
                </TableCell>
                <TableCell className="text-right">
                  <TeamMemberDialog member={member} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
