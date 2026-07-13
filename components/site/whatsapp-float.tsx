import { whatsappLink } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/site/icons";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site e gostaria de saber mais sobre a produção de noivas.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
