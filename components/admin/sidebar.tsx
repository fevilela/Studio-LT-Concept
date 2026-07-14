"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Users,
  UserRound,
  Settings,
  ImageIcon,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/equipe", label: "Equipe", icon: UserRound },
  { href: "/admin/galeria", label: "Galeria", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
