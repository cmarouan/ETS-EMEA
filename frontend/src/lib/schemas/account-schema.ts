import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  email: z.email("Saisissez une adresse e-mail valide."),
});
