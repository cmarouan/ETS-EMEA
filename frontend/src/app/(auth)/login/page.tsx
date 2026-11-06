import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <main className="bg-background grid min-h-screen lg:grid-cols-2">
      <section className="bg-primary text-primary-foreground relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-accent/25 absolute top-20 -left-20 size-80 rounded-full blur-3xl" />
        <div className="bg-primary-foreground/10 absolute right-0 -bottom-28 size-96 rounded-full blur-3xl" />
        <p className="relative text-xl font-bold tracking-tight">ETS EMEA</p>
        <div className="relative max-w-lg">
          <p className="text-primary-foreground/70 text-sm font-medium">
            Votre avenir commence ici
          </p>
          <h1 className="font-heading mt-4 text-5xl leading-tight font-semibold tracking-tight">
            Faites de votre niveau de langue votre prochain atout.
          </h1>
          <p className="text-primary-foreground/75 mt-6 max-w-md text-base leading-7">
            Planifiez votre test, suivez vos réservations et avancez vers vos objectifs
            professionnels.
          </p>
        </div>
        <p className="text-primary-foreground/60 relative text-sm">
          © ETS EMEA · Language assessment
        </p>
      </section>
      <section className="grid place-items-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <p className="text-primary text-xl font-bold">ETS EMEA</p>
            <p className="text-muted-foreground mt-1 text-sm">Language assessment</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
