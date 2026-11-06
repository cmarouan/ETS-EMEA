import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Account } from "@/types/account";

export async function getAccount() {
  const { data } = await apiClient.get<Account>(endpoints.account.profile);
  return data;
}
