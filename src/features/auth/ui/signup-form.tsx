"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupCredentialsSchema,
  type SignupCredentials,
} from "@/features/auth/model/credentials.schema";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/features/auth/model/use-auth";

export function SignupForm() {
  const router = useRouter();
  const { signUpWithPassword, isConfigured } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupCredentials>({
    resolver: zodResolver(signupCredentialsSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  if (!isConfigured) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Cadastro temporariamente indisponível. Tente de novo mais tarde.
      </p>
    );
  }

  if (confirmationSent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para seu e-mail. Após confirmar, faça
          login para continuar.
        </p>
        <Link
          href="/login"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Ir para login
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          const { needsEmailConfirmation } = await signUpWithPassword(
            values.email,
            values.password,
          );

          if (needsEmailConfirmation) {
            setConfirmationSent(true);
            return;
          }

          router.push("/");
          router.refresh();
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Não foi possível criar a conta. Tente de novo.",
          );
        }
      })}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="rounded-sm text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/55 focus-visible:outline-none"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
