import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Galeria | Thainá Souza",
  description: "Momentos inesquecíveis de produções de noivas.",
};

const categories = [
  "Produção",
  "Noiva",
  "Beleza",
  "Maquiagem",
  "Penteado",
  "Cerimônia",
  "Produção",
  "Beleza",
];

export default function GaleriaPage() {
  return (
    <Section className="pt-16">
      <Eyebrow>Galeria</Eyebrow>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl text-foreground">
        Momentos <span className="italic text-primary">inesquecíveis</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Fotos reais das produções em breve. Assim que a equipe enviar o acervo pelo painel
        administrativo, esta galeria será atualizada automaticamente.
      </p>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-accent to-primary/20"
          >
            <div className="absolute inset-0 flex items-end p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/70">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
