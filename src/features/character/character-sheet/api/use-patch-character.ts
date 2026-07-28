"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CharacterState } from "@/entities/character/session-types";
import type { UpdateCharacterPayload } from "@/entities/character/types";
import {
  charactersKeys,
  patchCharacter,
} from "@/features/character/characters/api/characters.api";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

function payloadTouchesHitPoints(payload: UpdateCharacterPayload) {
  return (
    payload.hitPointsCurrent !== undefined ||
    payload.hitPointsMax !== undefined
  );
}

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
    onSuccess: (data, variables) => {
      queryClient.setQueryData(charactersKeys.detail(characterId), data);
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });

      if (!payloadTouchesHitPoints(variables)) return;

      queryClient.setQueryData<CharacterState>(
        sessionKeys.state(characterId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            hitPointsCurrent:
              variables.hitPointsCurrent !== undefined
                ? (data.hitPointsCurrent ?? variables.hitPointsCurrent)
                : prev.hitPointsCurrent,
            hitPointsMax:
              variables.hitPointsMax !== undefined
                ? (data.hitPointsMax ?? variables.hitPointsMax)
                : prev.hitPointsMax,
          };
        },
      );
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.state(characterId),
      });
    },
  });
}
