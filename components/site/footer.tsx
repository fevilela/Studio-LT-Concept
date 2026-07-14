import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-foreground">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}. Lavras, Minas Gerais.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <WhatsAppIcon className="size-4" />
            </a>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label="E-mail"
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-foreground">
            Navegação
          </p>
          <ul className="mt-4 space-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/orcamento"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Orçamento
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-foreground">
            Contato
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
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
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados. Produção
          especializada em noivas.
        </p>
        <Link href="/privacidade" className="transition-colors hover:text-primary">
          Política de Privacidade
        </Link>
      </div>
    </footer>
  );
}
