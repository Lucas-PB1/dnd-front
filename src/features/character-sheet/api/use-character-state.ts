"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CastSpellPayload,
  PatchCharacterStatePayload,
  RestPayload,
} from "@/entities/character/session-types";
import {
  castCharacterSpell,
  fetchCharacterState,
  patchCharacterState,
  sessionKeys,
  takeCharacterRest,
} from "@/features/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function useCharacterState(characterId: string) {
  const { accessToken, handleUnauthorized } = useGameAuth(characterId);

  return useQuery({
    queryKey: sessionKeys.state(characterId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver o estado de jogo");
      }
      try {
        return await fetchCharacterState(accessToken, characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: !!accessToken && !!characterId,
  });
}

function useInvalidateState(characterId: string) {
  const queryClient = useQueryClient();
  return (state: Awaited<ReturnType<typeof fetchCharacterState>>) => {
    queryClient.setQueryData(sessionKeys.state(characterId), state);
  };
}

export function usePatchCharacterState(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const setState = useInvalidateState(characterId);

  return useMutation({
    mutationFn: async (payload: PatchCharacterStatePayload) => {
      try {
        return await patchCharacterState(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: setState,
  });
}

export function useCastSpell(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const setState = useInvalidateState(characterId);

  return useMutation({
    mutationFn: async (payload: CastSpellPayload) => {
      try {
        return await castCharacterSpell(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (result) setState(result.state);
    },
  });
}

export function useTakeRest(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const setState = useInvalidateState(characterId);

  return useMutation({
    mutationFn: async (payload: RestPayload) => {
      try {
        return await takeCharacterRest(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (result) setState(result.state);
    },
  });
}
