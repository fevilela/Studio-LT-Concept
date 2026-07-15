import { z } from "zod";

export const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome completo"),
  phone: z.string().trim().min(10, "Informe um telefone válido com DDD").max(20),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export type SignupValues = z.infer<typeof signupSchema>;
