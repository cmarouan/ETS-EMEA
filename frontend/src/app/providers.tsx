"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const redirectToLogin = () => {
      router.replace("/login");
      router.refresh();
    };

    window.addEventListener("auth:unauthorized", redirectToLogin);

    return () => window.removeEventListener("auth:unauthorized", redirectToLogin);
  }, [router]);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
