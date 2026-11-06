import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Reservation } from "@/types/reservation";

export async function getReservations() {
  const { data } = await apiClient.get<Reservation[]>(endpoints.reservations.list);
  return data;
}
