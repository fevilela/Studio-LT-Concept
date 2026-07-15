"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadSiteImage } from "@/app/admin/galeria/actions";

export function SiteImageSlot({
  imageKey,
  label,
  hint,
  currentUrl,
}: {
  imageKey: "hero" | "about";
  label: string;
  hint: string;
  currentUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await uploadSiteImage(formData);
        toast.success("Imagem atualizada.");
        formRef.current?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
        {currentUrl ? (
          <Image src={currentUrl} alt={label} fill sizes="400px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
        <input type="hidden" name="key" value={imageKey} />
        <Input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Enviando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
