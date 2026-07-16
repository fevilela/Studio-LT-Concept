"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-executa a busca de dados da página (Server Component) periodicamente,
 * sem precisar que a pessoa aperte F5 — usado nas telas de Conversas pra
 * novas mensagens do WhatsApp aparecerem sozinhas. */
export function AutoRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
