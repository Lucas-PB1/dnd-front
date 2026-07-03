import { AuthPageShell } from "@/features/auth/ui/auth-page-shell";
import { SignupForm } from "@/features/auth/ui/signup-form";

export default function SignupPage() {
  return (
    <AuthPageShell
      title="Criar conta"
      description="Cadastre-se para salvar fichas na dnd-api."
    >
      <SignupForm />
    </AuthPageShell>
  );
}
