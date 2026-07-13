import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Section className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Área da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O painel administrativo está em desenvolvimento e em breve estará disponível aqui
            para a equipe acompanhar orçamentos, agenda e conversas do WhatsApp.
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}
