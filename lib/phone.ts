/** Normaliza um telefone brasileiro digitado livremente para o formato E.164 (+55...). */
export function normalizeBrazilPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}
