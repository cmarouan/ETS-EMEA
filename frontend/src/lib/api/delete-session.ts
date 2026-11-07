import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export async function deleteSession(id: string) {
  await apiClient.delete(endpoints.sessions.byId(id));
}
