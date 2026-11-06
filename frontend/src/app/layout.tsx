import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ETS EMEA",
  description: "Réservation de sessions de tests de langues.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="font-sans">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
