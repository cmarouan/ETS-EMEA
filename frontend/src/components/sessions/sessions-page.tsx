"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, Filter, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import type { Session } from "@/types/session";
import { sessionFixtures } from "./session-fixtures";
import { SessionCard } from "./session-card";
import { SessionCardSkeleton } from "./session-card-skeleton";

const dayClassNames = {
  root: "w-full text-sm",
  months: "w-full",
  month: "w-full space-y-4",
  month_caption: "flex h-8 items-center justify-center font-semibold",
  nav: "absolute inset-x-0 flex justify-between px-1",
  button_previous: "grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted",
  button_next: "grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 flex-1 py-1 text-center text-xs font-medium text-muted-foreground",
  week: "mt-1 flex w-full",
  day: "flex-1 text-center",
  day_button:
    "grid size-9 place-items-center rounded-md text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
  today: "[&>button]:font-bold [&>button]:text-accent",
} as const;

const SESSIONS_PER_PAGE = 6;

export function SessionsPage() {
  const [date, setDate] = useState<Date>();
  const [language, setLanguage] = useState("all");
  const [location, setLocation] = useState("all");
  const [page, setPage] = useState(1);
  const [booking, setBooking] = useState<Session | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoadingPreview(false), 350);
    return () => window.clearTimeout(timeout);
  }, []);
  const filtered = useMemo(
    () =>
      sessionFixtures.filter(
        (session) =>
          (language === "all" || session.language === language) &&
          (location === "all" || session.location.includes(location)) &&
          (!date || new Date(session.startsAt).toDateString() === date.toDateString()),
      ),
    [date, language, location],
  );

  const shown = filtered.slice((page - 1) * SESSIONS_PER_PAGE, page * SESSIONS_PER_PAGE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / SESSIONS_PER_PAGE));
  const changeFilter = (setter: (value: string) => void, value: string | null) => {
    if (value) {
      setter(value);
      setPage(1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-6 py-8 shadow-[0_20px_50px_-20px_rgba(6,68,119,0.65)] sm:px-8">
        <div className="bg-accent/30 absolute -top-24 -right-16 size-64 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-primary-foreground/75 text-sm font-medium">
            Réservez votre prochaine évaluation
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sessions de test
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-xl text-sm leading-6">
            Trouvez une session près de chez vous et avancez avec confiance dans votre parcours
            linguistique.
          </p>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[310px_1fr]">
        <aside className="border-border bg-card h-fit rounded-2xl border p-5 shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center gap-2">
            <Filter className="text-accent size-4" />
            <h2 className="font-semibold">Affiner la recherche</h2>
          </div>
          <div className="border-border relative mt-5 rounded-xl border p-3">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(value) => {
                setDate(value);
                setPage(1);
              }}
              classNames={dayClassNames}
            />
          </div>
          {date ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setDate(undefined);
                setPage(1);
              }}
            >
              Effacer la date
            </Button>
          ) : null}
          <div className="mt-5 grid gap-3">
            <Select value={language} onValueChange={(value) => changeFilter(setLanguage, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les langues</SelectItem>
                <SelectItem value="English">Anglais</SelectItem>
                <SelectItem value="French">Français</SelectItem>
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={(value) => changeFilter(setLocation, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lieu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les centres</SelectItem>
                <SelectItem value="Casablanca">Casablanca</SelectItem>
                <SelectItem value="Rabat">Rabat</SelectItem>
                <SelectItem value="Marrakech">Marrakech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {filtered.length} session{filtered.length !== 1 ? "s" : ""} disponible
                {filtered.length !== 1 ? "s" : ""}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Choisissez la date et le centre qui vous conviennent.
              </p>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="text-accent size-4" />
              Maroc
            </div>
          </div>
          {isLoadingPreview ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: SESSIONS_PER_PAGE }, (_, index) => (
                <SessionCardSkeleton key={index} />
              ))}
            </div>
          ) : shown.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {shown.map((session) => (
                  <SessionCard key={session.id} session={session} onBook={setBooking} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination page={page} totalPages={pageCount} onPageChange={setPage} />
              </div>
            </>
          ) : (
            <EmptyState
              title="Aucune session trouvée"
              description="Essayez de modifier vos filtres pour voir davantage de disponibilités."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setDate(undefined);
                    setLanguage("all");
                    setLocation("all");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          )}
        </section>
      </div>
      <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && setBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre réservation</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de demander une place pour cette session.
            </DialogDescription>
          </DialogHeader>
          {booking ? (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-medium">{booking.exam}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(
                  new Date(booking.startsAt),
                )}
              </p>
              <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <CalendarDays className="size-4" />
                {booking.location}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBooking(null)}>
              Retour
            </Button>
            <Button
              onClick={() => {
                toast.error("La réservation sera disponible dès que l’API Symfony sera connectée.");
                setBooking(null);
              }}
            >
              Confirmer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
