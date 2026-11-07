"use client";

import { useEffect, useState } from "react";
import { CalendarClock, LoaderCircle, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { SessionFormDialog } from "@/components/management/session-form-dialog";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteSession } from "@/lib/api/delete-session";
import { getSessions } from "@/lib/api/get-sessions";
import type { Session } from "@/types/session";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});
const MANAGEMENT_PAGE_SIZE = 50;

export function SessionsManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [requestKey, setRequestKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void getSessions(page, MANAGEMENT_PAGE_SIZE)
      .then((response) => {
        if (isCurrent) {
          setSessions(response.data);
          setTotalItems(response.totalItems);
          setTotalPages(response.totalPages);
        }
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

  function reloadCurrentPage() {
    setIsLoading(true);
    setHasError(false);
    setRequestKey((key) => key + 1);
  }

  function openCreateForm() {
    setEditingSession(null);
    setFormOpen(true);
  }

  function openEditForm(session: Session) {
    setEditingSession(session);
    setFormOpen(true);
  }

  function handleSaved(savedSession: Session) {
    const exists = sessions.some((session) => session.id === savedSession.id);

    if (!exists && page !== 1) {
      changePage(1);
      return;
    }

    reloadCurrentPage();
  }

  async function confirmDelete() {
    if (!deletingSession) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSession(deletingSession.id);
      const previousPage = sessions.length === 1 && page > 1;
      setDeletingSession(null);
      toast.success("La session a été supprimée.");

      if (previousPage) {
        changePage(page - 1);
      } else {
        reloadCurrentPage();
      }
    } catch {
      toast.error("Cette session ne peut pas être supprimée.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-accent text-sm font-medium">Administration</p>
          <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">
            Gestion des sessions
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Créez, modifiez et supprimez les prochaines sessions de test.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="size-4" />
          Ajouter une session
        </Button>
      </section>

      {isLoading && sessions.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="h-24 w-full rounded-xl" key={index} />
          ))}
        </div>
      ) : hasError && sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">Impossible de charger les sessions.</p>
            <Button className="mt-4" variant="outline" onClick={reloadCurrentPage}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : sessions.length ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {totalItems} session{totalItems !== 1 ? "s" : ""} au total
            </p>
            {totalPages > 1 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={changePage}
              />
            ) : null}
          </div>
          {hasError ? (
            <div className="border-destructive/30 bg-destructive/5 mb-3 flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <p>La page demandée n’a pas pu être chargée.</p>
              <Button size="sm" variant="outline" onClick={reloadCurrentPage}>
                Réessayer
              </Button>
            </div>
          ) : null}
          <div
            className={`relative space-y-3 transition-opacity ${isLoading ? "pointer-events-none opacity-45" : ""}`}
            aria-busy={isLoading}
          >
            {sessions.map((session) => {
              const isFull = session.remainingSeats === 0;

              return (
                <article
                  className="border-border bg-card hover:border-accent/35 flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition sm:flex-row sm:items-center"
                  key={session.id}
                >
                  <div className="bg-primary/8 text-primary grid size-12 shrink-0 place-items-center rounded-xl">
                    <CalendarClock className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{session.code}</h2>
                      <Badge variant="outline">{session.language}</Badge>
                      <Badge variant={isFull ? "destructive" : "outline"}>
                        {isFull ? "Complet" : `${session.remainingSeats} places`}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span>{dateFormatter.format(new Date(session.startsAt))}</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> {session.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" /> {session.remainingSeats}/{session.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Modifier ${session.code}`}
                      onClick={() => openEditForm(session)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label={`Supprimer ${session.code}`}
                      onClick={() => setDeletingSession(session)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </article>
              );
            })}
            {isLoading ? (
              <div className="absolute inset-0 grid place-items-center" aria-live="polite">
                <div className="bg-card flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg">
                  <LoaderCircle className="text-accent size-4 animate-spin" />
                  Chargement des sessions…
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">Aucune session à gérer.</p>
          </CardContent>
        </Card>
      )}

      {formOpen ? (
        <SessionFormDialog
          key={editingSession?.id ?? "create"}
          open={formOpen}
          session={editingSession}
          onOpenChange={setFormOpen}
          onSaved={handleSaved}
        />
      ) : null}

      <Dialog
        open={Boolean(deletingSession)}
        onOpenChange={(open) => !open && setDeletingSession(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la session ?</DialogTitle>
            <DialogDescription>
              La session {deletingSession?.code} sera définitivement supprimée. Une session ayant
              des réservations ne peut pas être supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSession(null)}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={confirmDelete}>
              {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 />}
              {isDeleting ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
