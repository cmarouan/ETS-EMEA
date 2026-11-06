"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-background min-h-screen lg:flex">
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card fixed top-3 left-3 z-30 shadow-sm"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
        {open ? (
          <>
            <button
              className="bg-foreground/20 fixed inset-0 z-30 backdrop-blur-sm"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            />
            <div className="bg-card fixed inset-y-0 left-0 z-40 w-72 shadow-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
              <AppSidebar />
            </div>
          </>
        ) : null}
      </div>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
