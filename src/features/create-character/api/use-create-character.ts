"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  createCharacter,
} from "@/features/characters/api/characters.api";
import type { CreateCharacterPayload } from "@/entities/character/types";
import { useAuth } from "@/features/auth/model/use-auth";

export function useCreateCharacter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateCharacterPayload) => {
      if (!accessToken) {
        throw new Error("Faça login para criar uma ficha");
      }

      try {
        return await createCharacter(accessToken, payload);
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push("/login?next=/characters/new");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      router.push("/characters");
    },
  });
}
