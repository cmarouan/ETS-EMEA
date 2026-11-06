import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Session } from "@/types/session";

export async function getSessions() {
  const { data } = await apiClient.get<Session[]>(endpoints.sessions.list);
  return data;
}
