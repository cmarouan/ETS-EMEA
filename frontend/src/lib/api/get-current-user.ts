import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthenticatedUser } from "@/types/auth";

export async function getCurrentUser() {
  const { data } = await apiClient.get<AuthenticatedUser>(endpoints.auth.me);

  return data;
}
