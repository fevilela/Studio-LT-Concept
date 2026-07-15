import Link from "next/link";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { getCurrentTeamMember } from "@/lib/admin-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentTeamMember();

  return (
    <div className="flex min-h-full flex-col sm:flex-row">
      <AdminMobileNav memberName={member?.full_name} memberRole={member?.role} />

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-secondary/30 p-5 sm:flex">
        <Link href="/admin" className="mb-8 font-serif text-xl text-foreground">
          Thainá Souza
          <span className="mt-0.5 block text-xs font-sans font-normal uppercase tracking-wider text-muted-foreground">
            Painel Administrativo
          </span>
        </Link>
        <AdminSidebar />
        <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
          <div className="px-1">
            <p className="text-sm font-medium text-foreground">{member?.full_name}</p>
            <p className="text-xs capitalize text-muted-foreground">{member?.role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1">
        <main className="p-4 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
