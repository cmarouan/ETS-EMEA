"use client";

import { useState } from "react";
import { CalendarDays, Clock3, MapPin, TicketCheck } from "lucide-react";
import { toast } from "sonner";
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
import type { Reservation } from "@/types/reservation";

const reservations: Reservation[] = [
  {
    id: "res-01",
    sessionId: "ses-003",
    status: "confirmed",
    exam: "TOEFL iBT®",
    startsAt: "2026-05-18T09:30:00",
    location: "Casablanca — CFC",
  },
  {
    id: "res-02",
    sessionId: "ses-004",
    status: "pending",
    exam: "TFI™",
    startsAt: "2026-05-21T10:00:00",
    location: "Marrakech — Guéliz",
  },
];

export function ReservationsPage() {
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
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
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                      new Date(reservation.startsAt!),
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock3 className="text-accent size-4" />
                    {new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(
                      new Date(reservation.startsAt!),
                    )}
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
      <Dialog open={Boolean(cancelling)} onOpenChange={(open) => !open && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cette réservation ?</DialogTitle>
            <DialogDescription>
              Cette action sera envoyée à ETS EMEA après connexion de l’API.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>
              Conserver
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.error("L’annulation nécessite la connexion à l’API Symfony.");
                setCancelling(null);
              }}
            >
              Demander l’annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
