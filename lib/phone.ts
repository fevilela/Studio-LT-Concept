/** Normaliza um telefone brasileiro digitado livremente para o formato E.164 (+55...). */
export function normalizeBrazilPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

/** Monta um link wa.me para abrir uma conversa com um telefone específico (não o número do negócio). */
export function buildWaMeLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
