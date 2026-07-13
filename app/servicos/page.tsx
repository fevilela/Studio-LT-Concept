import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow } from "@/components/site/section";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Serviços | Thainá Souza",
  description: "Maquiagem, penteados e produção completa para noivas.",
};

export const revalidate = 60;

const categoryLabels: Record<string, string> = {
  maquiagem: "Maquiagem",
  penteado: "Penteado",
  cerimonia: "Cerimônia",
  pacote: "Pacote Completo",
};

function formatPrice(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ServicosPage() {
  const services = await getServices();

  return (
    <Section className="pt-16">
      <Eyebrow>O que fazemos</Eyebrow>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl text-foreground">
        Serviços para a <span className="italic text-primary">noiva perfeita</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Cada serviço é pensado com exclusividade e carinho. Nossa equipe dedicada cuida de cada
        detalhe para que você esteja radiante no seu grande dia. Os valores abaixo são de
        referência — o orçamento final é personalizado conforme a data e os detalhes do seu
        evento.
      </p>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="flex flex-col rounded-2xl border border-border/60 bg-card p-8"
          >
            <span className="font-serif text-3xl text-primary/50">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-xs uppercase tracking-wider text-primary">
              {categoryLabels[service.category] ?? service.category}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-foreground">{service.name}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <span className="font-serif text-xl text-primary">
                a partir de {formatPrice(service.base_price)}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{service.duration_minutes} min
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-secondary/50 p-10 text-center">
        <h2 className="font-serif text-3xl text-foreground">
          Não sabe qual serviço escolher?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Faça seu orçamento personalizado e descubra a combinação perfeita para o seu grande dia.
        </p>
        <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/orcamento" />}>
          Fazer Orçamento!
        </Button>
      </div>
    </Section>
  );
}
