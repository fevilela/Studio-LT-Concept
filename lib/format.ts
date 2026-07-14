export function formatPrice(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Converts a naive `datetime-local` input value (e.g. "2026-11-20T14:00",
 * no timezone) into an ISO string anchored to Brazil's business timezone
 * (Lavras, MG — fixed UTC-3, no DST since 2019), so it stores/displays as
 * the wall-clock time staff actually typed, regardless of server locale.
 */
export function localDateTimeToBrazilISO(value: string) {
  return `${value}:00-03:00`;
}
