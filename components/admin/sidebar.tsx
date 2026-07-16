"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Users,
  UserRound,
  Tag,
  ImageIcon,
  MessageCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NotificationsStatus = { unreadMessages: number; quotesCount: number };

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/admin/bot", label: "Bot de IA", icon: Sparkles },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/equipe", label: "Equipe", icon: UserRound },
  { href: "/admin/galeria", label: "Galeria", icon: ImageIcon },
  { href: "/admin/servicos", label: "Serviços", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data: NotificationsStatus = await res.json();
        if (!cancelled) setUnreadCount(data.unreadMessages);
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

  return (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {href === "/admin/conversas" && unreadCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center px-1.5">{unreadCount}</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
