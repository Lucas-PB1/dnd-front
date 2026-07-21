"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  charactersKeys,
  deleteCharacter,
} from "@/features/characters/api/characters.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

type UseDeleteCharacterOptions = {
  /** Quando true, só invalida a lista (já em /characters). */
  stayOnList?: boolean;
};

export function useDeleteCharacter(options: UseDeleteCharacterOptions = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { requireToken, handleUnauthorized } = useGameAuth("/characters");
  const stayOnList = options.stayOnList ?? false;

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
      if (!stayOnList) {
        router.push("/characters");
      }
    },
  });
}
