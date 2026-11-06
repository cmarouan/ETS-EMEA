import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RegisterPayload } from "@/types/auth";

export async function registerUser(payload: RegisterPayload) {
  await apiClient.post(endpoints.auth.register, payload);
}
