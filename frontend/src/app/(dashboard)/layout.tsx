import type { ReactNode } from "react";
import { CurrentUserProvider } from "@/components/auth/current-user-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <DashboardShell>{children}</DashboardShell>
    </CurrentUserProvider>
  );
}
