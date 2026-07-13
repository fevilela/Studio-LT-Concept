import { z } from "zod";

export const quoteFormSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome completo"),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido com DDD")
    .max(20, "Telefone inválido"),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  event_date: z.string().min(1, "Escolha a data do evento"),
  event_time: z.string().optional().or(z.literal("")),
  event_location: z.string().trim().max(200).optional().or(z.literal("")),
  number_of_people: z.number().int().min(1).max(50),
  service_ids: z.array(z.string().uuid()).min(1, "Selecione ao menos um serviço"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
