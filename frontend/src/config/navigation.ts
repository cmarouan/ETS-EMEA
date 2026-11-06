import type { LucideIcon } from "lucide-react";
import { CalendarDays, ClipboardList, UserRound } from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavigation: NavigationItem[] = [
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/reservations", label: "Réservations", icon: ClipboardList },
  { href: "/account", label: "Compte", icon: UserRound },
];
