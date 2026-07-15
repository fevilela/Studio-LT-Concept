import type { Metadata } from "next";
import Image from "next/image";
import { Section, Eyebrow } from "@/components/site/section";
import { InstagramIcon } from "@/components/site/icons";
import { getTeamMembers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Nossa Equipe | Thainá Souza",
  description: "Conheça a equipe de profissionais especializados em noivas.",
};

export const revalidate = 60;

export default async function EquipePage() {
  const team = await getTeamMembers();

  return (
    <Section className="pt-16">
      <Eyebrow>Nossa Equipe</Eyebrow>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl text-foreground">
        Profissionais <span className="italic text-primary">apaixonados</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Cada profissional foi escolhido com critério. Uma equipe dedicada e anos de experiência
        em atendimentos de noivas garantem um dia mágico e inesquecível.
      </p>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <div key={member.id} className="text-center">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-accent to-primary/15">
              {member.photo_url && (
                <Image
                  src={member.photo_url}
                  alt={member.full_name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            </div>
            <p className="mt-5 font-serif text-xl text-foreground">{member.full_name}</p>
            <p className="text-xs uppercase tracking-wider text-primary">{member.job_title}</p>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {member.bio}
            </p>
            {member.instagram_handle && (
              <a
                href={`https://instagram.com/${member.instagram_handle}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <InstagramIcon className="size-3.5" />@{member.instagram_handle}
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
