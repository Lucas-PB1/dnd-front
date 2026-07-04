"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  deleteCharacter,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (characterId: string) => {
      if (!accessToken) {
        throw new Error("Faça login para excluir a ficha");
      }

      try {
        await deleteCharacter(accessToken, characterId);
        return characterId;
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push("/login?next=/characters");
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
