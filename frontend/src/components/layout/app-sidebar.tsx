"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card sticky top-0 h-svh w-60 overflow-y-auto p-4">
      <div className="mb-8 px-3">
        <p className="text-primary text-lg font-bold tracking-tight">ETS EMEA</p>
        <p className="text-muted-foreground mt-1 text-xs">Language testing</p>
      </div>
      <nav aria-label="Navigation principale" className="space-y-1">
        {dashboardNavigation.map(({ href, icon: Icon, label }) => (
          <Link
            className={cn(
              "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === href &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
