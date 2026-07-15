"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupValues } from "@/lib/validations/signup";
import { normalizeBrazilPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";

export function SignupForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    setError(null);
    const supabase = createClient();
    const phone = normalizeBrazilPhone(values.phone);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name, phone } },
    });

    if (error) {
      setError(
        error.message.includes("already registered") || error.status === 422
          ? "Já existe uma conta com esse e-mail. Tente entrar."
          : "Não foi possível criar sua conta. Tente novamente."
      );
      return;
    }

    if (data.session) {
      router.push(nextPath ?? "/orcamento");
      router.refresh();
    } else {
      setAwaitingConfirmation(true);
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="space-y-3 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <p className="text-sm text-foreground">Quase lá!</p>
        <p className="text-sm text-muted-foreground">
          Enviamos um e-mail de confirmação para você. Clique no link recebido para ativar sua
          conta e depois entre normalmente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" {...register("full_name")} />
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
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );
}
