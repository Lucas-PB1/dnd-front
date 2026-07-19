"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  charactersKeys,
  deleteCharacter,
} from "@/features/characters/api/characters.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { requireToken, handleUnauthorized } = useGameAuth("/characters");

  return useMutation({
    mutationFn: async (characterId: string) => {
      const accessToken = requireToken("Faça login para excluir a ficha");
      try {
        await deleteCharacter(accessToken, characterId);
        return characterId;
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      router.push("/characters");
    },
  });
}
