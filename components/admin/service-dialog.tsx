"use client";

import { useState, useTransition } from "react";
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
import { saveService } from "@/app/admin/configuracoes/actions";
import type { ServiceAdmin } from "@/lib/admin-data/services";

const categories = [
  { value: "maquiagem", label: "Maquiagem" },
  { value: "penteado", label: "Penteado" },
  { value: "cerimonia", label: "Cerimônia" },
  { value: "pacote", label: "Pacote Completo" },
];

export function ServiceDialog({ service }: { service?: ServiceAdmin }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(service);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await saveService(formData);
        toast.success(isEdit ? "Serviço atualizado." : "Serviço criado.");
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
        {isEdit ? (
          <Pencil className="size-4" />
        ) : (
          <>
            <Plus className="size-4" /> Novo serviço
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEdit ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {service && <input type="hidden" name="id" value={service.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={service?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue={service?.category ?? "maquiagem"}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="base_price">Preço (R$)</Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service?.base_price}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (min)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={15}
                step={15}
                defaultValue={service?.duration_minutes ?? 60}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={service?.description ?? ""}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
