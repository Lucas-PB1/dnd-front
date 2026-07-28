"use client";

import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import { useAuth } from "@/features/auth/model/use-auth";

/**
 * Token + redirect 401 para rotas de jogo.
 * `loginNext` é o path em `?next=` (ex.: `/characters/:id`).
 */
export function useGameAuth(loginNext: string) {
  const router = useRouter();
  const { accessToken } = useAuth();

  function requireToken(
    message = "Faça login para usar a mesa de jogo",
  ): string {
    if (!accessToken) {
      throw new Error(message);
    }
    return accessToken;
  }

  function handleUnauthorized(error: unknown): never {
    if (error instanceof ApiError && error.isUnauthorized) {
      router.push(`/login?next=${loginNext}`);
    }
    throw error;
  }

  return { accessToken, requireToken, handleUnauthorized };
}
