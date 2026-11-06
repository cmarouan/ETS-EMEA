import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Account } from "@/types/account";

export interface UpdateAccountPayload {
  name: string;
  email: string;
}

interface UpdateAccountResponse {
  user: Account;
}

export async function updateAccount(payload: UpdateAccountPayload) {
  const { data } = await apiClient.put<UpdateAccountResponse>(endpoints.account.profile, payload);

  return data.user;
}
