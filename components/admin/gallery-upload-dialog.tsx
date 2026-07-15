"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadGalleryImage } from "@/app/admin/galeria/actions";

const CATEGORY_SUGGESTIONS = [
  "Produção",
  "Noiva",
  "Beleza",
  "Maquiagem",
  "Penteado",
  "Cerimônia",
];

export function GalleryUploadDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await uploadGalleryImage(formData);
        toast.success("Foto enviada.");
        formRef.current?.reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Upload className="size-4" /> Enviar foto
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Enviar foto</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Foto</Label>
            <Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou AVIF, até 10MB.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input id="title" name="title" placeholder="Ex: Noiva Camila - Cerimônia" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input id="category" name="category" list="gallery-categories" placeholder="Ex: Maquiagem" />
            <datalist id="gallery-categories">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
