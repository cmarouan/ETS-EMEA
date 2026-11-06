import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Saisissez une adresse e-mail valide."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
