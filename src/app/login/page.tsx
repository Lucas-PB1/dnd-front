import { Suspense } from "react";

import { AuthPageShell } from "@/features/auth/ui/auth-page-shell";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Entrar"
      description="Entre para acessar suas fichas e o compêndio."
    >
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
