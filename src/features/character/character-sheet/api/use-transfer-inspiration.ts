"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  sessionKeys,
  transferInspiration,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

/** Transfere Inspiração Heroica para outro personagem (mesmo dono / campanha). */
export function useTransferInspiration(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetCharacterId: string) => {
      try {
        return await transferInspiration(
          requireToken(),
          characterId,
          targetCharacterId,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result, targetCharacterId) => {
      if (!result) return;
      queryClient.setQueryData(
        sessionKeys.state(characterId),
        result.sourceState,
      );
      queryClient.setQueryData(
        sessionKeys.state(targetCharacterId),
        result.targetState,
      );
    },
  });
}
