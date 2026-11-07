import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function deleteReservation(id: string) {
  await apiClient.delete(endpoints.reservations.byId(id));
}
