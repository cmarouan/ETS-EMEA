import { z } from "zod";

export const sessionSchema = z
  .object({
    code: z.string().trim().min(1, "Le code est requis.").max(50),
    language: z.string().trim().min(1, "La langue est requise.").max(50),
    startsAt: z.string().min(1, "La date et l’heure sont requises."),
    location: z.string().trim().min(1, "Le lieu est requis.").max(180),
    capacity: z.number().int().positive("La capacité doit être supérieure à zéro."),
    remainingSeats: z.number().int().min(0, "Le nombre de places ne peut pas être négatif."),
  })
  .refine((values) => values.remainingSeats <= values.capacity, {
    message: "Les places restantes ne peuvent pas dépasser la capacité.",
    path: ["remainingSeats"],
  });

export type SessionFormValues = z.infer<typeof sessionSchema>;
