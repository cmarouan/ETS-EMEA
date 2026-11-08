"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-register";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/register-schema";

export function RegisterForm() {
  const registration = useRegister();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <Card className="border-border border py-0 shadow-[0_24px_60px_-30px_rgba(6,68,119,0.32)]">
      <CardContent className="p-7 sm:p-8">
        <form onSubmit={handleSubmit(registration.mutate)}>
          <div className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl">
            <UserRound className="size-5" />
          </div>
          <h1 className="font-heading mt-6 text-2xl font-semibold tracking-tight">
            Créer un compte
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Inscrivez-vous pour réserver et gérer vos sessions de test.
          </p>
          <div className="mt-7 space-y-5">
            <div>
              <Label htmlFor="register-name">
                <UserRound className="text-accent size-4" />
                Nom complet
              </Label>
              <Input
                id="register-name"
                className="mt-2 h-10"
                autoComplete="name"
                placeholder="Votre nom"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="register-email">
                <Mail className="text-accent size-4" />
                E-mail
              </Label>
              <Input
                id="register-email"
                className="mt-2 h-10"
                autoComplete="email"
                type="email"
                placeholder="vous@exemple.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="register-password">
                <LockKeyhole className="text-accent size-4" />
                Mot de passe
              </Label>
              <Input
                id="register-password"
                className="mt-2 h-10"
                autoComplete="new-password"
                type="password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
              ) : null}
            </div>
          </div>
          {registration.error ? (
            <p className="text-destructive mt-4 text-sm">{registration.error}</p>
          ) : null}
          <Button className="mt-7 h-10 w-full" disabled={registration.isPending} type="submit">
            {registration.isPending ? (
              "Création du compte…"
            ) : (
              <>
                Créer mon compte <ArrowRight />
              </>
            )}
          </Button>
          <p className="text-muted-foreground mt-5 text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <Link
              className="text-accent font-medium hover:underline"
              href="/login"
              onClick={() => reset()}
            >
              Se connecter
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
