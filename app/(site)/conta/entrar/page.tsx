import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/site/login-form";

export const metadata: Metadata = {
  title: "Entrar | Thainá Souza",
  description: "Entre na sua conta para fazer um orçamento.",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Entrar na sua conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm nextPath={next ?? "/orcamento"} />
          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href={next ? `/conta/cadastro?next=${encodeURIComponent(next)}` : "/conta/cadastro"}
              className="text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}
