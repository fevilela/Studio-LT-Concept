import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow } from "@/components/site/section";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Quem Somos | Thainá Souza",
  description: "Conheça a história por trás do Studio LT Concept.",
};

export default function QuemSomosPage() {
  return (
    <>
      <Section className="pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-tr from-primary/15 via-accent to-secondary lg:order-1" />
          <div className="order-1 lg:order-2">
            <Eyebrow>Quem Somos</Eyebrow>
            <h1 className="mt-4 font-serif text-5xl text-foreground">
              Olá, meu nome é <span className="italic text-primary">Thainá Souza</span>
            </h1>
            <p className="mt-6 text-lg italic leading-relaxed text-muted-foreground">
              &ldquo;Trabalhamos com sonhos, e eles são o nosso bem mais valioso!&rdquo;
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Um currículo com mais de 10 especializações na área de produções de noivas, atuo há
              mais de 10 anos ajudando noivas na escolha assertiva para sua produção e planejando
              cada segundo da produção mais especial da sua vida.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nossa missão é proporcionar uma experiência memorável, cuidando de cada detalhe para
              que você possa relaxar e aproveitar ao máximo cada instante do seu grande dia.
            </p>
            <Button className="mt-8" nativeButton={false} render={<Link href="/orcamento" />}>
              Fazer Orçamento!
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-8 sm:grid-cols-3">
          {siteConfig.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-card p-8 text-center"
            >
              <p className="font-serif text-5xl text-primary">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
