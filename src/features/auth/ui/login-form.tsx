"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginCredentialsSchema,
  type LoginCredentials,
} from "@/features/auth/model/credentials.schema";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/features/auth/model/use-auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const { signInWithPassword, isConfigured } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!isConfigured) {
    return (
      <p className="text-sm text-destructive">
        Supabase não configurado. Preencha{" "}
        <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> no
        .env.
      </p>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-5"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          await signInWithPassword(values.email, values.password);
          router.push(nextPath);
          router.refresh();
        } catch (error) {
          setSubmitError(
            error instanceof Error ? error.message : "Falha ao entrar",
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
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
