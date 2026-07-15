"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";

export function AdminMobileNav({
  memberName,
  memberRole,
}: {
  memberName?: string;
  memberRole?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background px-4 py-3 sm:hidden">
      <Link href="/admin" className="font-serif text-lg text-foreground">
        Thainá Souza
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="font-serif text-xl">Painel Administrativo</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col px-4">
            <div onClick={() => setOpen(false)}>
              <AdminSidebar />
            </div>
            <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
              <div className="px-1">
                <p className="text-sm font-medium text-foreground">{memberName}</p>
                <p className="text-xs capitalize text-muted-foreground">{memberRole}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
