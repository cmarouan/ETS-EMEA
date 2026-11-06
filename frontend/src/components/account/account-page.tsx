"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle, Mail, RefreshCw, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useCurrentUser } from "@/components/auth/current-user-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { updateAccount } from "@/lib/api/update-account";
import { accountSchema } from "@/lib/schemas/account-schema";

type AccountValues = { name: string; email: string };

export function AccountPage() {
  const { user, isLoading, hasError, setUser, refreshUser } = useCurrentUser();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", email: "" },
  });
  const accountName = useWatch({ control, name: "name" });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const initials =
    accountName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "--";

  async function onSubmit(values: AccountValues) {
    try {
      const account = await updateAccount(values);
      reset({ name: account.name, email: account.email });
      setUser(account);
      toast.success("Vos informations ont été mises à jour.");
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data.message
        : undefined;

      toast.error(message ?? "Impossible de mettre à jour vos informations.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-accent text-sm font-medium">Préférences</p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">Mon compte</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations associées à votre espace candidat.
        </p>
      </div>
      <Card className="border-border border shadow-sm">
        <CardHeader className="border-border border-b">
          <CardTitle>Informations personnelles</CardTitle>
          <p className="text-muted-foreground text-sm">
            Modifiez le nom et l’adresse e-mail associés à votre compte.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-5" aria-label="Chargement du compte">
              <Skeleton className="size-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : hasError || !user ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="font-medium">Impossible de charger votre compte.</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Vérifiez votre connexion puis réessayez.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void refreshUser()}>
                <RefreshCw className="size-4" />
                Réessayer
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-2xl text-lg font-semibold">
                {initials}
              </div>
              <div>
                <Label htmlFor="name">
                  <UserRound className="text-accent size-4" />
                  Nom complet
                </Label>
                <Input id="name" className="mt-2 h-10" autoComplete="name" {...register("name")} />
                {errors.name && (
                  <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="text-accent size-4" />
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  className="mt-2 h-10"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
                )}
              </div>
              <div className="border-border flex justify-end border-t pt-5">
                <Button disabled={!isDirty || isSubmitting} type="submit">
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
