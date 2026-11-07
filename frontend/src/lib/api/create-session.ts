import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Session, SessionPayload } from "@/types/session";

export async function createSession(payload: SessionPayload) {
  const { data } = await apiClient.post<Session>(endpoints.sessions.list, payload);
  return data;
}
