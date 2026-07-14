"use client";

import { useTransition } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateQuoteStatus } from "@/app/admin/orcamentos/actions";

export function QuoteStatusActions({ quoteId, status }: { quoteId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  function handleUpdate(newStatus: string) {
    startTransition(async () => {
      try {
        await updateQuoteStatus(quoteId, newStatus);
        toast.success("Status atualizado.");
      } catch {
        toast.error("Não foi possível atualizar o status.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <Button size="sm" disabled={isPending} onClick={() => handleUpdate("approved")}>
          <Check className="size-4" /> Aprovar
        </Button>
      )}
      {status !== "rejected" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handleUpdate("rejected")}
        >
          <X className="size-4" /> Recusar
        </Button>
      )}
      {status !== "pending" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => handleUpdate("pending")}
        >
          <RotateCcw className="size-4" /> Voltar para pendente
        </Button>
      )}
    </div>
  );
}
