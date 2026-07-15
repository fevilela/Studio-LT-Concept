import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/site/signup-form";

export const metadata: Metadata = {
  title: "Criar conta | Thainá Souza",
  description: "Crie sua conta para solicitar um orçamento.",
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Criar sua conta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para fazer um orçamento, crie uma conta rapidinho.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm nextPath={next} />
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href={next ? `/conta/entrar?next=${encodeURIComponent(next)}` : "/conta/entrar"}
              className="text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}
