import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z.email("Saisissez une adresse e-mail valide."),
});
