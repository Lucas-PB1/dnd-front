"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateCharacterPayload } from "@/entities/character/types";
import {
  charactersKeys,
  patchCharacter,
} from "@/features/characters/api/characters.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function usePatchCharacter(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (payload: UpdateCharacterPayload) => {
      const accessToken = requireToken("Faça login para editar a ficha");
      try {
        return await patchCharacter(accessToken, characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(charactersKeys.detail(characterId), data);
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
    },
  });
}
