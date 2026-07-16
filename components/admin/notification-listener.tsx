"use client";

import { useEffect, useRef } from "react";
import { playNotificationSound } from "@/lib/notification-sound";

type NotificationsStatus = { unreadMessages: number; quotesCount: number };

/** Toca um som quando surge mensagem de WhatsApp ou orçamento novo. Sem UI —
 * fica montado uma única vez no layout do admin (não duplicar, senão o som
 * toca em dobro). */
export function NotificationListener() {
  const previous = useRef<NotificationsStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data: NotificationsStatus = await res.json();
        if (cancelled) return;

        const prev = previous.current;
        if (
          prev &&
          (data.unreadMessages > prev.unreadMessages || data.quotesCount > prev.quotesCount)
        ) {
          playNotificationSound();
        }
        previous.current = data;
      } catch {
        // ignora falhas de rede pontuais — tenta de novo no próximo intervalo
      }
    }

    fetchNotifications();
    const id = setInterval(fetchNotifications, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
}
