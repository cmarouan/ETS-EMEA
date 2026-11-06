import { useState } from "react";
import { login } from "@/lib/api/login";
import type { LoginPayload } from "@/types/auth";

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  async function mutate(payload: LoginPayload) {
    setIsPending(true);
    setIsError(false);

    try {
      await login(payload);
    } catch {
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending, isError };
}
