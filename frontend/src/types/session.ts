export interface Session {
  id: string;
  code: string;
  language: string;
  startsAt: string;
  location: string;
  capacity: number;
  remainingSeats: number;
}

export interface SessionPayload {
  code: string;
  language: string;
  startsAt: string;
  location: string;
  capacity: number;
  remainingSeats: number;
}
