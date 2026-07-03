import { Suspense } from "react";

import { AuthPageShell } from "@/features/auth/ui/auth-page-shell";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Entrar"
      description="Use sua conta Supabase para acessar fichas e campanhas."
    >
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
      >
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
