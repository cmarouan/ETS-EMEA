export interface Reservation {
  id: string;
  sessionId: string;
  status: "pending" | "confirmed" | "cancelled";
  exam?: string;
  startsAt?: string;
  location?: string;
}
