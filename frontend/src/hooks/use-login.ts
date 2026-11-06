import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/api/login";
import type { LoginPayload } from "@/types/auth";

export function useLogin() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(payload: LoginPayload) {
    setIsPending(true);
    setError(null);

    try {
      await login(payload);
      toast.success("Connexion réussie.");
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/sessions";
      router.replace(destination);
      router.refresh();
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError) && requestError.response?.status === 401
          ? "Adresse e-mail ou mot de passe incorrect."
          : "La connexion est indisponible pour le moment.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return { mutate, isPending, error };
}
