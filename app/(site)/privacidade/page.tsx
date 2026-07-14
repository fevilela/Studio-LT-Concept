import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/site/section";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidade | Thainá Souza",
  description: "Como o Studio LT Concept coleta, usa e protege seus dados.",
};

export default function PrivacidadePage() {
  return (
    <Section className="pt-16">
      <Eyebrow>Privacidade</Eyebrow>
      <h1 className="mt-4 max-w-2xl font-serif text-4xl text-foreground">
        Política de <span className="italic text-primary">Privacidade</span>
      </h1>
      <p className="mt-3 text-xs text-muted-foreground">Última atualização: julho de 2026.</p>

      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-serif text-xl text-foreground">Quais dados coletamos</h2>
          <p className="mt-2">
            Quando você preenche o formulário de orçamento, entra em contato pelo WhatsApp ou
            agenda um atendimento, coletamos: nome completo, telefone, e-mail (quando informado),
            detalhes do evento (data, local, número de pessoas) e o histórico das conversas
            trocadas com a nossa equipe e com o assistente virtual pelo WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Como usamos esses dados</h2>
          <p className="mt-2">
            Usamos essas informações exclusivamente para: calcular e enviar orçamentos, organizar
            a agenda de atendimentos, responder dúvidas (por um atendente ou pelo nosso assistente
            virtual com inteligência artificial) e manter contato sobre o seu atendimento. Não
            vendemos nem compartilhamos seus dados com terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Assistente virtual (IA)</h2>
          <p className="mt-2">
            Parte do atendimento pelo WhatsApp pode ser feita por um assistente virtual que usa
            inteligência artificial para responder dúvidas frequentes, consultar disponibilidade
            de horários e registrar orçamentos. A qualquer momento você pode pedir para falar com
            uma pessoa da equipe, e a conversa será transferida.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Quem tem acesso</h2>
          <p className="mt-2">
            Apenas a equipe do Studio LT Concept, autenticada em nosso sistema interno, tem acesso
            aos seus dados e ao histórico de conversas. Utilizamos o Supabase (infraestrutura de
            banco de dados) e a Meta (WhatsApp Business) como provedores técnicos para operar o
            atendimento.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Seus direitos</h2>
          <p className="mt-2">
            Conforme a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a qualquer
            momento a correção, exclusão ou uma cópia dos seus dados. Basta entrar em contato
            pelo e-mail{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">
              {siteConfig.email}
            </a>{" "}
            ou pelo telefone {siteConfig.phone}.
          </p>
        </section>
      </div>
    </Section>
  );
}
