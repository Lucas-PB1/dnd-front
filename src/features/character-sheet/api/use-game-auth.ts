"use client";

import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import { useAuth } from "@/features/auth/model/use-auth";

export function useGameAuth(characterId: string) {
  const router = useRouter();
  const { accessToken } = useAuth();

  function requireToken(): string {
    if (!accessToken) {
      throw new Error("Faça login para usar a mesa de jogo");
    }
    return accessToken;
  }

  function handleUnauthorized(error: unknown): never {
    if (error instanceof ApiError && error.isUnauthorized) {
      router.push(`/login?next=/characters/${characterId}`);
    }
    throw error;
  }

  return { accessToken, requireToken, handleUnauthorized };
}
