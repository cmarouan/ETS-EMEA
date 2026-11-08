"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/components/auth/current-user-provider";
import { logout } from "@/lib/api/logout";

export function AppHeader() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      setMenuOpen(false);
      setIsLoggingOut(false);
      toast.success("Vous êtes déconnecté.");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Impossible de vous déconnecter pour le moment.");
      setIsLoggingOut(false);
    }
  }

  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "--";

  return (
    <header className="border-border/80 bg-card/80 sticky top-0 z-20 flex h-16 items-center justify-end border-b px-4 backdrop-blur lg:px-8">
      <div className="relative flex items-center gap-2">
        <button
          className="hover:bg-muted ml-2 flex items-center gap-2 rounded-lg p-1.5 text-left transition"
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
            {initials}
          </span>
          <span className="hidden sm:block">
            <span className="block max-w-40 truncate text-sm font-medium">
              {user?.name ?? "Chargement…"}
            </span>
            <span className="text-muted-foreground block max-w-40 truncate text-xs">
              {user?.email ?? "Espace candidat"}
            </span>
          </span>
          <ChevronDown
            className={`text-muted-foreground size-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {menuOpen ? (
          <div
            className="border-border bg-popover absolute top-12 right-0 w-56 rounded-xl border p-1.5 shadow-xl"
            role="menu"
          >
            <Link
              href="/account"
              className="hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              <UserRound className="text-muted-foreground size-4" />
              Mon compte
            </Link>
            <button
              className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition disabled:opacity-50"
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
