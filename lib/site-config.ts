export const siteConfig = {
  name: "Thainá Souza",
  brand: "Studio LT Concept",
  tagline: "Produção especializada em noivas",
  description:
    "Maquiagem, penteados e produção completa para noivas em Lavras, MG.",
  phone: "(35) 98875-9110",
  phoneWhatsapp: "5535988759110",
  email: "thainasouzaestudiolt@gmail.com",
  address: "R. Irmão Luiz Croembrook, 15 – Centenário, Lavras – MG, 37203-623",
  hours: "Terça a sexta das 13h às 18h",
  instagram: "https://instagram.com/thainasouza.studiolt",
  stats: [
    { label: "Anos", value: "10+" },
    { label: "Noivas", value: "500+" },
    { label: "Avaliação", value: "5★" },
  ],
  nav: [
    { label: "Início", href: "/" },
    { label: "Serviços", href: "/servicos" },
    { label: "Quem Somos", href: "/quem-somos" },
    { label: "Galeria", href: "/galeria" },
    { label: "Nossa Equipe", href: "/equipe" },
  ],
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${siteConfig.phoneWhatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
