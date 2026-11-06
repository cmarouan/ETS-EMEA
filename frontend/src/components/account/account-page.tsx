"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountSchema } from "@/lib/schemas/account-schema";

type AccountValues = { name: string; email: string };

export function AccountPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "Espace candidat", email: "candidat@example.com" },
  });
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
            Ces informations seront synchronisées lorsque l’API sera disponible.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            className="space-y-5"
            onSubmit={handleSubmit(() =>
              toast.error("La mise à jour du profil nécessite la connexion à l’API Symfony."),
            )}
          >
            <div className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-2xl text-lg font-semibold">
              EC
            </div>
            <div>
              <Label htmlFor="name">
                <UserRound className="text-accent size-4" />
                Nom complet
              </Label>
              <Input id="name" className="mt-2 h-10" {...register("name")} />
              {errors.name && (
                <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">
                <Mail className="text-accent size-4" />
                Adresse e-mail
              </Label>
              <Input id="email" className="mt-2 h-10" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="border-border flex justify-end border-t pt-5">
              <Button disabled={!isDirty} type="submit">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
