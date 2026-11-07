import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Reservation } from "@/types/reservation";

export async function createReservation(sessionId: string) {
  const { data } = await apiClient.post<Reservation>(endpoints.reservations.list, { sessionId });
  return data;
}
