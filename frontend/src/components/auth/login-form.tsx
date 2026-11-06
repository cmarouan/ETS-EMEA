"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-login";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/login-schema";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  return (
    <Card className="border-border border py-0 shadow-[0_24px_60px_-30px_rgba(6,68,119,0.32)]">
      <CardContent className="p-7 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl">
            <LockKeyhole className="size-5" />
          </div>
          <h1 className="font-heading mt-6 text-2xl font-semibold tracking-tight">Bienvenue</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Connectez-vous pour gérer vos tests et réservations.
          </p>
          <div className="mt-7 space-y-5">
            <div>
              <Label htmlFor="email">
                <Mail className="text-accent size-4" />
                E-mail
              </Label>
              <Input
                id="email"
                className="mt-2 h-10"
                autoComplete="email"
                type="email"
                placeholder="vous@exemple.com"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
            ) : null}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  <LockKeyhole className="text-accent size-4" />
                  Mot de passe
                </Label>
                <button type="button" className="text-accent text-xs font-medium hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
              <Input
                id="password"
                className="mt-2 h-10"
                autoComplete="current-password"
                type="password"
                {...register("password")}
              />
            </div>
            {errors.password ? (
              <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
            ) : null}
          </div>
          {login.error ? <p className="text-destructive mt-4 text-sm">{login.error}</p> : null}
          <Button className="mt-7 h-10 w-full" disabled={login.isPending} type="submit">
            {login.isPending ? (
              "Connexion…"
            ) : (
              <>
                Se connecter <ArrowRight />
              </>
            )}
          </Button>
          <p className="text-muted-foreground mt-5 text-center text-xs leading-5">
            En vous connectant, vous acceptez les conditions d’utilisation d’ETS EMEA.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
