import type { LucideIcon } from "lucide-react";
import { CalendarDays, ClipboardList, Settings2, UserRound } from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const dashboardNavigation: NavigationItem[] = [
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/reservations", label: "Réservations", icon: ClipboardList },
  { href: "/account", label: "Compte", icon: UserRound },
  {
    href: "/management/sessions",
    label: "Gestion des sessions",
    icon: Settings2,
    adminOnly: true,
  },
];
