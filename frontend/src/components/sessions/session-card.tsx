"use client";

import { Clock3, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Session } from "@/types/session";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function SessionCard({
  session,
  onBook,
}: {
  session: Session;
  onBook: (session: Session) => void;
}) {
  const date = new Date(session.startsAt);
  const limited = session.availableSeats <= 4;

  return (
    <Card className="group border-border bg-card overflow-visible border py-0 shadow-[0_12px_30px_-22px_rgba(6,68,119,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_rgba(6,68,119,0.35)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="bg-primary/8 text-primary rounded-xl px-3 py-2 text-center">
            <p className="text-[11px] font-semibold tracking-wider uppercase">
              {dateFormatter.format(date).split(" ")[0]}
            </p>
            <p className="text-2xl leading-6 font-bold">{date.getDate()}</p>
          </div>
          <Badge variant="outline" className="border-primary/15 bg-primary/5 text-primary">
            {session.language}
          </Badge>
        </div>
        <h2 className="font-heading mt-5 text-lg font-semibold tracking-tight">{session.exam}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {dateFormatter.format(date)} · {timeFormatter.format(date)}
        </p>
        <div className="text-muted-foreground mt-5 space-y-2.5 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="text-accent size-4" />
            {session.location}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="text-accent size-4" />
            Durée : {session.duration}
          </p>
          <p
            className={"flex items-center gap-2 " + (limited ? "text-destructive" : "text-success")}
          >
            <Users className="size-4" />
            {session.availableSeats} place{session.availableSeats > 1 ? "s" : ""} restante
            {session.availableSeats > 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-border bg-muted/45 flex items-center justify-between gap-3 border-t px-5 py-3.5">
        <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className={"h-full rounded-full " + (limited ? "bg-destructive" : "bg-success")}
            style={{ width: `${(session.availableSeats / session.totalSeats) * 100}%` }}
          />
        </div>
        <Button size="sm" onClick={() => onBook(session)}>
          Réserver
        </Button>
      </CardFooter>
    </Card>
  );
}
