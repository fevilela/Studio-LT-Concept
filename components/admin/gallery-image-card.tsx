"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { galleryImageUrl } from "@/lib/format";
import {
  deleteGalleryImage,
  moveGalleryImage,
  toggleGalleryImageActive,
  updateGalleryImageDetails,
} from "@/app/admin/galeria/actions";
import type { GalleryImageAdmin } from "@/lib/admin-data/gallery";

export function GalleryImageCard({
  image,
  isFirst,
  isLast,
}: {
  image: GalleryImageAdmin;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleGalleryImageActive(image.id, !image.active);
      } catch {
        toast.error("Não foi possível atualizar.");
      }
    });
  }

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      try {
        await moveGalleryImage(image.id, direction);
      } catch {
        toast.error("Não foi possível reordenar.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta foto? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      try {
        await deleteGalleryImage(image.id, image.storage_path);
        toast.success("Foto excluída.");
      } catch {
        toast.error("Não foi possível excluir.");
      }
    });
  }

  function handleEditSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateGalleryImageDetails(formData);
        toast.success("Foto atualizada.");
        setEditOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="relative aspect-[3/4] bg-secondary">
        <Image
          src={galleryImageUrl(image.storage_path)}
          alt={image.title ?? "Foto da galeria"}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-medium text-foreground">
          {image.title ?? "Sem título"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{image.category ?? "—"}</span>
          <button type="button" onClick={handleToggle} disabled={isPending} className="cursor-pointer">
            <Badge variant={image.active ? "default" : "outline"}>
              {image.active ? "Visível" : "Oculta"}
            </Badge>
          </button>
        </div>
        <div className="flex items-center justify-between gap-1 pt-1">
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Mover para cima"
              disabled={isPending || isFirst}
              onClick={() => handleMove("up")}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Mover para baixo"
              disabled={isPending || isLast}
              onClick={() => handleMove("down")}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Editar" />}>
                <Pencil className="size-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Editar foto</DialogTitle>
                </DialogHeader>
                <form action={handleEditSubmit} className="space-y-4">
                  <input type="hidden" name="id" value={image.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`title-${image.id}`}>Título</Label>
                    <Input id={`title-${image.id}`} name="title" defaultValue={image.title ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${image.id}`}>Categoria</Label>
                    <Input
                      id={`category-${image.id}`}
                      name="category"
                      defaultValue={image.category ?? ""}
                    />
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full">
                    Salvar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Excluir"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
