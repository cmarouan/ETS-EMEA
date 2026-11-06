import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z.email("Saisissez une adresse e-mail valide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(4096, "Le mot de passe est trop long."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
