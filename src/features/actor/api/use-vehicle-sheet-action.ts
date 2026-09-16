"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VehicleSheetActionPayload } from "@/entities/actor/vehicle-sheet";
import { syncCharacterTransportCaches } from "@/features/actor/api/sync-character-transport-caches";
import { postVehicleSheetAction } from "@/features/actor/api/vehicle-sheet-actions.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

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
      syncCharacterTransportCaches(
        queryClient,
        characterId,
        result.boardedActorId,
        payload.actorId ?? result.actorState?.actorId,
      );
    },
  });
}
