"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/site/icons";
import { getOrCreateConversationForClient } from "@/app/admin/orcamentos/actions";

export function StartConversationButton({
  clientId,
  clientPhone,
  clientName,
}: {
  clientId: string;
  clientPhone: string;
  clientName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const firstName = clientName.split(" ")[0];
        const conversationId = await getOrCreateConversationForClient(
          clientId,
          clientPhone,
          firstName
        );
        router.push(`/admin/conversas/${conversationId}`);
      } catch {
        toast.error("Não foi possível abrir a conversa.");
      }
    });
  }

  return (
    <Button
      className="mt-2 w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <WhatsAppIcon className="size-4" />}
      Iniciar conversa no WhatsApp
    </Button>
  );
}
