"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/site/icons";
import { sendReactivationMessage } from "@/app/admin/conversas/actions";

export function ReactivateConversationButton({
  conversationId,
  phoneNumber,
  clientName,
}: {
  conversationId: string;
  phoneNumber: string;
  clientName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const firstName = clientName.split(" ")[0];
        await sendReactivationMessage(conversationId, phoneNumber, firstName);
        toast.success("Mensagem de reengajamento enviada.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar.");
      }
    });
  }

  return (
    <Button
      size="sm"
      className="bg-[#25D366] text-white hover:bg-[#1ebe5a]"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <WhatsAppIcon className="size-4" />
      )}
      Reenviar mensagem de contato
    </Button>
  );
}
