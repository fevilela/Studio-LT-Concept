import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Section, Eyebrow } from "@/components/site/section";
import { QuoteForm } from "@/components/site/quote-form";
import { getServices } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureClientProfile } from "@/lib/ensure-client-profile";

export const metadata: Metadata = {
  title: "Orçamento | Thainá Souza",
  description: "Faça seu orçamento personalizado para o seu grande dia.",
};

export const dynamic = "force-dynamic";

export default async function OrcamentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/conta/entrar?next=/orcamento");

  const profile = await ensureClientProfile(user);
  const services = await getServices();

  return (
    <Section className="pt-16">
      <div className="grid gap-14 lg:grid-cols-[1fr_320px]">
        <div>
          <Eyebrow>Orçamento</Eyebrow>
          <h1 className="mt-4 max-w-xl font-serif text-5xl text-foreground">
            Entre em contato e faça o seu <span className="italic text-primary">orçamento!</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Preencha o passo a passo abaixo e receba o valor estimado na hora. Em seguida, nossa
            equipe entrará em contato para confirmar os detalhes.
          </p>

          <div className="mt-10">
            <QuoteForm
              services={services}
              defaultValues={
                profile
                  ? { full_name: profile.full_name, phone: profile.phone, email: profile.email ?? "" }
                  : undefined
              }
            />
          </div>
        </div>

        <aside className="h-fit space-y-6 rounded-2xl border border-border/60 bg-card p-8">
          <h2 className="font-serif text-xl text-foreground">Contato direto</h2>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              {siteConfig.phone}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              {siteConfig.email}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {siteConfig.address}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              {siteConfig.hours}
            </li>
          </ul>
        </aside>
      </div>
    </Section>
  );
}
