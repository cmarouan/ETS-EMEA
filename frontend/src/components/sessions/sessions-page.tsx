"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getSessions } from "@/lib/api/get-sessions";
import type { Session } from "@/types/session";
import { SessionCard } from "./session-card";
import { SessionCardSkeleton } from "./session-card-skeleton";

const SESSIONS_PER_PAGE = 6;

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [booking, setBooking] = useState<Session | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getSessions(page, SESSIONS_PER_PAGE)
      .then((response) => {
        if (!isCurrent) {
          return;
        }

        setSessions(response.data);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      })
      .catch(() => {
        if (isCurrent) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [page, requestKey]);

  function changePage(nextPage: number) {
    setIsLoading(true);
    setHasError(false);
    setPage(nextPage);
  }

  function retry() {
    setIsLoading(true);
    setHasError(false);
    setRequestKey((key) => key + 1);
  }

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
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {totalItems} session{totalItems !== 1 ? "s" : ""} disponible
              {totalItems !== 1 ? "s" : ""}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Choisissez la date et le centre qui vous conviennent.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {totalPages > 1 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={changePage}
              />
            ) : null}
          </div>
        </div>
        {isLoading && sessions.length === 0 ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: SESSIONS_PER_PAGE }, (_, index) => (
              <SessionCardSkeleton key={index} />
            ))}
          </div>
        ) : hasError && sessions.length === 0 ? (
          <EmptyState
            title="Impossible de charger les sessions"
            description="Vérifiez votre connexion puis réessayez."
            action={
              <Button variant="outline" onClick={retry}>
                Réessayer
              </Button>
            }
          />
        ) : sessions.length ? (
          <>
            {hasError ? (
              <div className="border-destructive/30 bg-destructive/5 mb-4 flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
                <p>La page demandée n’a pas pu être chargée.</p>
                <Button size="sm" variant="outline" onClick={retry}>
                  Réessayer
                </Button>
              </div>
            ) : null}
            <div className="relative">
              <div
                className={`grid gap-5 transition-opacity md:grid-cols-2 2xl:grid-cols-3 ${isLoading ? "pointer-events-none opacity-45" : ""}`}
                aria-busy={isLoading}
              >
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} onBook={setBooking} />
                ))}
                {Array.from(
                  { length: Math.max(0, SESSIONS_PER_PAGE - sessions.length) },
                  (_, index) => (
                    <div className="invisible" aria-hidden="true" key={`placeholder-${index}`}>
                      <SessionCardSkeleton />
                    </div>
                  ),
                )}
              </div>
              {isLoading ? (
                <div className="absolute inset-0 grid place-items-center" aria-live="polite">
                  <div className="bg-card text-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg">
                    <LoaderCircle className="text-accent size-4 animate-spin" />
                    Chargement des sessions…
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <EmptyState
            title="Aucune session trouvée"
            description="Aucune session future n’est disponible pour le moment."
          />
        )}
      </section>
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
              <p className="font-medium">Session {booking.code}</p>
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
