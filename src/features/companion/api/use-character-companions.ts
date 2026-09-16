"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { CHARACTER_STATE_STALE_MS } from "@/features/character/characters/api/character-query";
import { invalidateCharacterCompanionCaches } from "@/features/companion/api/invalidate-character-companion-caches";
import {
  companionKeys,
  dismissCharacterCompanion,
  fetchCharacterCompanions,
  type DismissCharacterCompanionPayload,
} from "@/features/companion/api/companions.api";

export function useCharacterCompanions(characterId: string, enabled = true) {
  const { accessToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useQuery({
    queryKey: companionKeys.list(characterId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver companheiros");
      }
      try {
        return await fetchCharacterCompanions(accessToken, characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: enabled && !!accessToken && !!characterId,
    staleTime: CHARACTER_STATE_STALE_MS,
  });
}

export function useDismissCharacterCompanion(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (payload: DismissCharacterCompanionPayload = {}) => {
      try {
        return await dismissCharacterCompanion(
          requireToken(),
          characterId,
          payload,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: () => {
      invalidateCharacterCompanionCaches(queryClient, characterId);
    },
  });
}
