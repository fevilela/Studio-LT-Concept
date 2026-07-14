"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { toggleTeamMemberActive } from "@/app/admin/equipe/actions";

export function TeamMemberActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleTeamMemberActive(id, !active);
      } catch {
        toast.error("Não foi possível atualizar.");
      }
    });
  }

  return (
    <button type="button" onClick={handleToggle} disabled={isPending} className="cursor-pointer">
      <Badge variant={active ? "default" : "outline"}>{active ? "Ativa" : "Inativa"}</Badge>
    </button>
  );
}
