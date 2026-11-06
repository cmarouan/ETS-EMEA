import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/lib/api/register";
import type { RegisterPayload } from "@/types/auth";

export function useRegister() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(payload: RegisterPayload) {
    setIsPending(true);
    setError(null);

    try {
      await registerUser(payload);
      toast.success("Votre compte a été créé. Vous pouvez maintenant vous connecter.");
      router.replace("/login");
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data.message
        : undefined;

      setError(message ?? "L’inscription est indisponible pour le moment.");
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending, error };
}
