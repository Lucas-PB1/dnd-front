"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VehicleSheetActionPayload } from "@/entities/actor/vehicle-sheet";
import { actorKeys } from "@/features/actor/api/use-actors";
import { postVehicleSheetAction } from "@/features/actor/api/vehicle-sheet-actions.api";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

export function useVehicleSheetAction(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (payload: VehicleSheetActionPayload) => {
      try {
        return await postVehicleSheetAction(
          requireToken(),
          characterId,
          payload,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result, payload) => {
      queryClient.setQueryData(
        sessionKeys.state(characterId),
        (prev: { boardedActorId?: string | null } | undefined) =>
          prev
            ? { ...prev, boardedActorId: result.boardedActorId }
            : prev,
      );
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.state(characterId),
      });
      void queryClient.invalidateQueries({
        queryKey: actorKeys.byCharacter(characterId),
      });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(characterId),
      });
      const actorId = payload.actorId ?? result.actorState?.actorId;
      if (actorId) {
        void queryClient.invalidateQueries({
          queryKey: actorKeys.detail(actorId),
        });
      }
    },
  });
}
