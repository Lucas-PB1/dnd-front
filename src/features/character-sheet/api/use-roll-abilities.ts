"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  rollAbilities,
  type RollAbilitiesPayload,
} from "@/features/character-sheet/api/character-build.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function useRollAbilities() {
  const router = useRouter();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: RollAbilitiesPayload) => {
      if (!accessToken) {
        throw new Error("Faça login para gerar atributos");
      }

      try {
        return await rollAbilities(accessToken, payload);
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push("/login?next=/characters/new");
        }
        throw error;
      }
    },
  });
}
