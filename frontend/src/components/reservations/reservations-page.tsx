"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, LoaderCircle, MapPin, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
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
import { deleteReservation } from "@/lib/api/delete-reservation";
import { getReservations } from "@/lib/api/get-reservations";
import type { Reservation } from "@/types/reservation";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void getReservations()
      .then((data) => {
        if (isCurrent) {
          setReservations(data);
          setHasError(false);
        }
      })
      .catch(() => {
        if (isCurrent) setHasError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [requestKey]);

  function retry() {
    setIsLoading(true);
    setHasError(false);
    setRequestKey((key) => key + 1);
  }

  async function confirmCancellation() {
    if (!cancelling) return;

    setIsCancelling(true);

    try {
      await deleteReservation(cancelling.id);
      setReservations((current) =>
        current.filter((reservation) => reservation.id !== cancelling.id),
      );
      setCancelling(null);
      toast.success("Votre réservation a été annulée.");
    } catch {
      toast.error("Impossible d’annuler cette réservation.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-accent text-sm font-medium">Votre parcours</p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">
          Mes réservations
        </h1>
        <p className="text-muted-foreground mt-2">
          Retrouvez ici vos sessions à venir et leur statut.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton className="h-32 w-full rounded-xl" key={index} />
          ))}
        </div>
      ) : hasError ? (
        <EmptyState
          title="Impossible de charger vos réservations"
          description="Vérifiez votre connexion puis réessayez."
          action={
            <Button variant="outline" onClick={retry}>
              Réessayer
            </Button>
          }
        />
      ) : reservations.length ? (
        <div className="grid gap-5">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="border-border border py-0 shadow-sm">
              <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                <div className="bg-primary/8 text-primary grid size-12 shrink-0 place-items-center rounded-xl">
                  <TicketCheck className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{reservation.exam}</h2>
                    <Badge variant="outline">{reservation.language}</Badge>
                    <Badge
                      variant={reservation.status === "confirmed" ? "default" : "outline"}
                      className={
                        reservation.status === "pending"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : ""
                      }
                    >
                      {reservation.status === "confirmed" ? "Confirmée" : "En attente"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="text-accent size-4" />
                      {dateFormatter.format(new Date(reservation.startsAt))}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="text-accent size-4" />
                      {timeFormatter.format(new Date(reservation.startsAt))}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="text-accent size-4" />
                      {reservation.location}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setCancelling(reservation)}
                >
                  Annuler
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucune réservation"
          description="Réservez une session pour la retrouver ici."
        />
      )}

      <Dialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && !isCancelling && setCancelling(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cette réservation ?</DialogTitle>
            <DialogDescription>
              Votre place pour la session {cancelling?.exam} sera libérée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isCancelling} onClick={() => setCancelling(null)}>
              Conserver
            </Button>
            <Button variant="destructive" disabled={isCancelling} onClick={confirmCancellation}>
              {isCancelling ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isCancelling ? "Annulation…" : "Annuler la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
