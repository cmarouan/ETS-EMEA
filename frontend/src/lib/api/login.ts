import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { LoginPayload } from "@/types/auth";

export async function login(payload: LoginPayload) {
  await apiClient.post(endpoints.auth.login, payload);
}
