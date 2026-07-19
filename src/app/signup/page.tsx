import { AuthPageShell } from "@/features/auth/ui/auth-page-shell";
import { SignupForm } from "@/features/auth/ui/signup-form";

export default function SignupPage() {
  return (
    <AuthPageShell
      title="Criar conta"
      description="Crie uma conta para salvar e editar suas fichas."
    >
      <SignupForm />
    </AuthPageShell>
  );
}
