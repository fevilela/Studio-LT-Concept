"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveTeamMember } from "@/app/admin/equipe/actions";
import type { TeamMemberAdmin } from "@/lib/admin-data/team";

export function TeamMemberDialog({ member }: { member?: TeamMemberAdmin }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(member);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await saveTeamMember(formData);
        toast.success(isEdit ? "Profissional atualizada." : "Profissional adicionada.");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button size="icon-sm" variant="ghost" aria-label="Editar" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {isEdit ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" /> Nova profissional
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEdit ? "Editar profissional" : "Nova profissional"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {member && <input type="hidden" name="id" value={member.id} />}

          <div className="space-y-2">
            <Label htmlFor="photo">Foto</Label>
            {member?.photo_url && (
              <div className="relative size-20 overflow-hidden rounded-full bg-secondary">
                <Image src={member.photo_url} alt={member.full_name} fill className="object-cover" />
              </div>
            )}
            <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
            <p className="text-xs text-muted-foreground">
              {member?.photo_url ? "Envie uma nova foto para substituir a atual." : "Opcional."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={member?.full_name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo</Label>
            <Input
              id="job_title"
              name="job_title"
              placeholder="Ex.: Maquiadora"
              defaultValue={member?.job_title ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel no sistema</Label>
            <Select name="role" defaultValue={member?.role ?? "staff"}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Equipe</SelectItem>
                <SelectItem value="admin">Administradora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_handle">Instagram (sem @)</Label>
            <Input
              id="instagram_handle"
              name="instagram_handle"
              defaultValue={member?.instagram_handle ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={3} defaultValue={member?.bio ?? ""} />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
