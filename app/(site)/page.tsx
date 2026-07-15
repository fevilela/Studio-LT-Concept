import Link from "next/link";
import Image from "next/image";
import { Sparkles, Heart, Users, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Eyebrow } from "@/components/site/section";
import { InstagramIcon } from "@/components/site/icons";
import { siteConfig } from "@/lib/site-config";
import { getServices, getTeamMembers, getSiteImages } from "@/lib/data";
import { galleryImageUrl } from "@/lib/format";

export const revalidate = 60;

const highlights = [
  { icon: Sparkles, label: "Maquiagem" },
  { icon: Heart, label: "Penteados" },
  { icon: Users, label: "Produção de Noivas" },
  { icon: Sparkles, label: "+10 Anos de Experiência" },
  { icon: MapPin, label: "Lavras, MG" },
  { icon: Heart, label: "Atendimento Personalizado" },
];

export default async function HomePage() {
  const [services, team, siteImages] = await Promise.all([
    getServices(),
    getTeamMembers(),
    getSiteImages(),
  ]);
  const heroUrl = siteImages.hero ? galleryImageUrl(siteImages.hero) : null;
  const aboutUrl = siteImages.about ? galleryImageUrl(siteImages.about) : null;

  return (
    <>
      {/* HERO */}
      <Section className="pt-16 pb-16 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Produção especializada em noivas</Eyebrow>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl">
              Opções para <span className="italic text-primary">o seu grande dia.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Nosso Dia da Noiva foi cuidadosamente planejado para proporcionar momentos de
              relaxamento e beleza. Oferecemos um serviço exclusivo e personalizado, garantindo
              que você esteja radiante e confiante no seu grande dia.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" nativeButton={false} render={<Link href="/orcamento" />}>
                Fazer Orçamento! <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/equipe" />}>
                Conheça a Equipe
              </Button>
            </div>

            <dl className="mt-14 flex gap-10">
              {siteConfig.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-serif text-4xl text-primary">{stat.value}</dd>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-secondary to-primary/20">
            {heroUrl && (
              <Image
                src={heroUrl}
                alt="Studio LT Concept"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            {!heroUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="px-10 text-center font-serif text-2xl italic text-foreground/70">
                  &ldquo;Trabalhamos com sonhos, e eles são o nosso bem mais valioso.&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* HIGHLIGHTS STRIP */}
      <Section tone="muted" className="py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {highlights.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="size-5 text-primary" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm uppercase tracking-[0.25em] text-primary">
          +10 especializações em noivas
        </p>
      </Section>

      {/* QUEM SOMOS PREVIEW */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative order-2 aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-tr from-primary/15 via-accent to-secondary lg:order-1">
            {aboutUrl && (
              <Image
                src={aboutUrl}
                alt="Thainá Souza"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Quem Somos</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl text-foreground">
              Olá, meu nome é <span className="italic text-primary">Thainá Souza</span>
            </h2>
            <p className="mt-6 text-base italic leading-relaxed text-muted-foreground">
              &ldquo;Trabalhamos com sonhos, e eles são o nosso bem mais valioso!&rdquo;
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Um currículo com mais de 10 especializações na área de produções de noivas, atuo há
              mais de 10 anos ajudando noivas na escolha assertiva para sua produção e planejando
              cada segundo da produção mais especial da sua vida. Nossa missão é proporcionar uma
              experiência memorável, cuidando de cada detalhe para que você possa relaxar e
              aproveitar ao máximo cada instante do seu grande dia.
            </p>
            <Button className="mt-8" nativeButton={false} render={<Link href="/orcamento" />}>
              Fazer Orçamento!
            </Button>
          </div>
        </div>
      </Section>

      {/* SERVIÇOS */}
      <Section tone="muted">
        <div className="max-w-xl">
          <Eyebrow>O que fazemos</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-foreground">
            Serviços para a <span className="italic text-primary">noiva perfeita</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Cada serviço é pensado com exclusividade e carinho. Nossa equipe dedicada cuida de
            cada detalhe para que você esteja radiante no seu grande dia.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="rounded-2xl border border-border/60 bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="font-serif text-3xl text-primary/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-serif text-xl text-foreground">{service.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* EQUIPE PREVIEW */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Nossa Equipe</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl text-foreground">
              Profissionais <span className="italic text-primary">apaixonados</span>
            </h2>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/equipe" />}>
            Ver equipe completa <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {team.map((member) => (
            <div key={member.id} className="text-center">
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-accent to-primary/15">
                {member.photo_url && (
                  <Image
                    src={member.photo_url}
                    alt={member.full_name}
                    fill
                    sizes="(max-width: 640px) 33vw, 20vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-4 font-serif text-lg text-foreground">{member.full_name}</p>
              <p className="text-xs uppercase tracking-wider text-primary">{member.job_title}</p>
              {member.instagram_handle && (
                <a
                  href={`https://instagram.com/${member.instagram_handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  <InstagramIcon className="size-3.5" />@{member.instagram_handle}
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section tone="muted" className="text-center">
        <Eyebrow>Orçamento</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl text-foreground">
          Entre em contato e faça o seu <span className="italic text-primary">orçamento!</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Segundo o passo a passo, você terá o seu orçamento com o valor final no mesmo instante.
        </p>
        <Button size="lg" className="mt-8" nativeButton={false} render={<Link href="/orcamento" />}>
          Clique aqui para fazer o orçamento!
        </Button>
      </Section>
    </>
  );
}
