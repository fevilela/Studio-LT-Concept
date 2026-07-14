"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveBotConfig } from "@/app/admin/bot/actions";
import type { BotConfig } from "@/lib/admin-data/bot";

export function BotConfigForm({ config }: { config: BotConfig }) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(config.active);

  function handleSubmit(formData: FormData) {
    formData.set("active", active ? "on" : "off");
    startTransition(async () => {
      try {
        await saveBotConfig(formData);
        toast.success("Configuração do bot salva.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Bot ativo</p>
          <p className="text-xs text-muted-foreground">
            Quando ligado, novas conversas do WhatsApp são respondidas automaticamente pela IA
            até que a cliente peça para falar com alguém.
          </p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system_prompt">Como o bot deve se comportar</Label>
        <Textarea
          id="system_prompt"
          name="system_prompt"
          rows={16}
          defaultValue={config.system_prompt}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="escalation_keywords">
          Palavras que sempre transferem para um humano (separadas por vírgula)
        </Label>
        <Input
          id="escalation_keywords"
          name="escalation_keywords"
          defaultValue={config.escalation_keywords.join(", ")}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        Salvar configuração
      </Button>
    </form>
  );
}
