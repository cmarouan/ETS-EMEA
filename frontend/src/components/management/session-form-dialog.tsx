"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSession } from "@/lib/api/create-session";
import { updateSession } from "@/lib/api/update-session";
import { sessionSchema, type SessionFormValues } from "@/lib/schemas/session-schema";
import type { Session, SessionPayload } from "@/types/session";

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function SessionFormDialog({
  open,
  session,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  session: Session | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (session: Session) => void;
}) {
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session
      ? {
          code: session.code,
          language: session.language,
          startsAt: toDateTimeLocal(session.startsAt),
          location: session.location,
          capacity: session.capacity,
          remainingSeats: session.remainingSeats,
        }
      : {
          code: "",
          language: "",
          startsAt: "",
          location: "",
          capacity: 1,
          remainingSeats: 1,
        },
  });

  async function onSubmit(values: SessionFormValues) {
    setRequestError(null);

    const payload: SessionPayload = {
      ...values,
      startsAt: new Date(values.startsAt).toISOString(),
    };

    try {
      const savedSession = session
        ? await updateSession(session.id, payload)
        : await createSession(payload);

      onSaved(savedSession);
      onOpenChange(false);
      toast.success(session ? "La session a été mise à jour." : "La session a été créée.");
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data.message
        : undefined;

      setRequestError(message ?? "Impossible d’enregistrer la session.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? "Modifier la session" : "Ajouter une session"}</DialogTitle>
          <DialogDescription>
            {session
              ? "Mettez à jour les informations et la disponibilité de cette session."
              : "Renseignez les informations de la nouvelle session de test."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="session-code">Code</Label>
            <Input id="session-code" className="mt-2" {...register("code")} />
            {errors.code ? (
              <p className="text-destructive mt-1 text-xs">{errors.code.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="session-language">Langue</Label>
            <Input id="session-language" className="mt-2" {...register("language")} />
            {errors.language ? (
              <p className="text-destructive mt-1 text-xs">{errors.language.message}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="session-starts-at">Date et heure</Label>
            <Input
              id="session-starts-at"
              className="mt-2"
              type="datetime-local"
              {...register("startsAt")}
            />
            {errors.startsAt ? (
              <p className="text-destructive mt-1 text-xs">{errors.startsAt.message}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="session-location">Lieu</Label>
            <Input id="session-location" className="mt-2" {...register("location")} />
            {errors.location ? (
              <p className="text-destructive mt-1 text-xs">{errors.location.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="session-capacity">Capacité</Label>
            <Input
              id="session-capacity"
              className="mt-2"
              type="number"
              min={1}
              {...register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity ? (
              <p className="text-destructive mt-1 text-xs">{errors.capacity.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="session-remaining-seats">Places restantes</Label>
            <Input
              id="session-remaining-seats"
              className="mt-2"
              type="number"
              min={0}
              {...register("remainingSeats", { valueAsNumber: true })}
            />
            {errors.remainingSeats ? (
              <p className="text-destructive mt-1 text-xs">{errors.remainingSeats.message}</p>
            ) : null}
          </div>
          {requestError ? (
            <p className="text-destructive text-sm sm:col-span-2">{requestError}</p>
          ) : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {isSubmitting ? "Enregistrement…" : session ? "Enregistrer" : "Créer la session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
