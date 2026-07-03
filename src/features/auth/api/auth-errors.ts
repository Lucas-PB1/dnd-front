export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (lower.includes("user already registered")) {
    return "Este e-mail já está cadastrado.";
  }

  if (lower.includes("password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (lower.includes("signup is disabled")) {
    return "Cadastro desabilitado neste projeto Supabase.";
  }

  return message;
}
