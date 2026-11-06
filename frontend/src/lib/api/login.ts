import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthenticatedUser, LoginPayload } from "@/types/auth";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthenticatedUser>(endpoints.auth.login, payload);
  return data;
}
