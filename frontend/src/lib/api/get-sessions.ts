import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/api";
import type { Session } from "@/types/session";

export async function getSessions(page: number, limit: number) {
  const { data } = await apiClient.get<PaginatedResponse<Session>>(endpoints.sessions.list, {
    params: { page, limit },
  });

  return data;
}
