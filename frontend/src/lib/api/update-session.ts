import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Session, SessionPayload } from "@/types/session";

export async function updateSession(id: string, payload: SessionPayload) {
  const { data } = await apiClient.put<Session>(endpoints.sessions.byId(id), payload);
  return data;
}
