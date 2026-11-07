export interface Reservation {
  id: string;
  sessionId: string;
  status: "pending" | "confirmed";
  bookedAt: string;
  exam: string;
  language: string;
  startsAt: string;
  location: string;
}
