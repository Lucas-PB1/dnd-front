"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LevelUpPayload } from "@/entities/character/session-types";
import {
  applyLevelUp,
  fetchLevelUpPreview,
  progressionKeys,
} from "@/features/character-sheet/api/character-progression.api";
import { charactersKeys } from "@/features/characters/api/characters.api";
import { sessionKeys } from "@/features/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function useLevelUpPreview(characterId: string, enabled = true) {
  const { accessToken, handleUnauthorized } = useGameAuth(characterId);

  return useQuery({
    queryKey: progressionKeys.preview(characterId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver o level-up");
      }
      try {
        return await fetchLevelUpPreview(accessToken, characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: enabled && !!accessToken && !!characterId,
  });
}

export function useLevelUp(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);

  return useMutation({
    mutationFn: async (payload: LevelUpPayload) => {
      try {
        return await applyLevelUp(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (character) => {
      if (!character) return;
      queryClient.setQueryData(charactersKeys.detail(characterId), character);
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.preview(characterId),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.state(characterId),
      });
    },
  });
}
