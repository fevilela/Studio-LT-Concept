"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote";
import type { Service } from "@/lib/data";

function formatPrice(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function QuoteForm({ services }: { services: Service[] }) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      number_of_people: 1,
      service_ids: [],
    },
  });

  const selectedIds = watch("service_ids") ?? [];
  const total = services
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.base_price), 0);

  async function onSubmit(values: QuoteFormValues) {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Erro ao enviar orçamento");
      }
      setSubmitted(true);
      toast.success("Orçamento enviado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar orçamento");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h3 className="mt-4 font-serif text-2xl text-foreground">Orçamento recebido!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Obrigada pelo interesse! Em breve a equipe da Thainá entrará em contato pelo telefone ou
          WhatsApp informado para confirmar os detalhes do seu grande dia.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" placeholder="Seu nome" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" placeholder="(35) 99999-9999" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail (opcional)</Label>
          <Input id="email" type="email" placeholder="voce@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_of_people">Número de pessoas</Label>
          <Input
            id="number_of_people"
            type="number"
            min={1}
            max={50}
            {...register("number_of_people", { valueAsNumber: true })}
          />
          {errors.number_of_people && (
            <p className="text-xs text-destructive">{errors.number_of_people.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_date">Data do evento</Label>
          <Input id="event_date" type="date" {...register("event_date")} />
          {errors.event_date && (
            <p className="text-xs text-destructive">{errors.event_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_time">Horário (opcional)</Label>
          <Input id="event_time" type="time" {...register("event_time")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="event_location">Local do evento (opcional)</Label>
          <Input
            id="event_location"
            placeholder="Nome do local, endereço ou cidade"
            {...register("event_location")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Serviços desejados</Label>
        <Controller
          control={control}
          name="service_ids"
          render={({ field }) => (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => {
                const checked = field.value?.includes(service.id) ?? false;
                return (
                  <label
                    key={service.id}
                    className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const next = value
                          ? [...(field.value ?? []), service.id]
                          : (field.value ?? []).filter((id) => id !== service.id);
                        field.onChange(next);
                      }}
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {service.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        a partir de {formatPrice(service.base_price)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.service_ids && (
          <p className="text-xs text-destructive">{errors.service_ids.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Conte um pouco mais sobre o seu grande dia..."
          rows={4}
          {...register("notes")}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-secondary/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Valor estimado
          </p>
          <p className="font-serif text-3xl text-primary">
            {total > 0 ? formatPrice(String(total)) : "—"}
          </p>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Enviar orçamento
        </Button>
      </div>
    </form>
  );
}
