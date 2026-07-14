"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendManualReply } from "@/app/admin/conversas/actions";

export function ConversationReplyForm({
  conversationId,
  phoneNumber,
}: {
  conversationId: string;
  phoneNumber: string;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await sendManualReply(formData);
        formRef.current?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex items-end gap-2">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <input type="hidden" name="phone_number" value={phoneNumber} />
      <Textarea
        name="content"
        placeholder="Escreva uma resposta..."
        rows={2}
        required
        className="flex-1 resize-none"
      />
      <Button type="submit" size="icon" disabled={isPending} aria-label="Enviar">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
    </form>
  );
}
