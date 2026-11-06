import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <AuthPageShell>
      <LoginForm />
    </AuthPageShell>
  );
}
