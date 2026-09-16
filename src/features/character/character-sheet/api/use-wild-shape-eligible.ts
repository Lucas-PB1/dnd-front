"use client";

import { useQuery } from "@tanstack/react-query";

import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  fetchWildShapeEligible,
  wildShapeKeys,
} from "@/features/character/character-sheet/api/wild-shape.api";
import { CHARACTER_STATE_STALE_MS } from "@/features/character/characters/api/character-query";

export function useWildShapeEligible(
  characterId: string,
  enabled = true,
) {
  const { accessToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useQuery({
    queryKey: wildShapeKeys.eligible(characterId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver formas selvagens elegíveis");
      }
      try {
        return await fetchWildShapeEligible(accessToken, characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: enabled && !!accessToken && !!characterId,
    staleTime: CHARACTER_STATE_STALE_MS,
  });
}
