"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertQuoteToAppointment } from "@/app/admin/orcamentos/actions";

type TeamMember = { id: string; full_name: string };

export function ConvertToAppointmentForm({
  quoteId,
  clientId,
  teamMembers,
}: {
  quoteId: string;
  clientId: string;
  teamMembers: TeamMember[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await convertQuoteToAppointment(formData);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível agendar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="quote_id" value={quoteId} />
      <input type="hidden" name="client_id" value={clientId} />

      <div className="space-y-2">
        <Label htmlFor="team_member_id">Profissional</Label>
        <Select name="team_member_id" required>
          <SelectTrigger id="team_member_id" className="w-full">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_time">Data e horário</Label>
        <Input id="start_time" name="start_time" type="datetime-local" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local (opcional)</Label>
        <Input id="location" name="location" placeholder="Endereço do atendimento" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        Confirmar agendamento
      </Button>
    </form>
  );
}
