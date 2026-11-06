export interface Session {
  id: string;
  language: "English" | "French";
  exam: string;
  startsAt: string;
  location: string;
  availableSeats: number;
  totalSeats: number;
  duration: string;
}
