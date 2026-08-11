"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CastSpellPayload,
  PatchCharacterStatePayload,
  RestPayload,
  UseClassResourcePayload,
} from "@/entities/character/session-types";
import {
  castCharacterSpell,
  fetchCharacterState,
  patchCharacterState,
  sessionKeys,
  takeCharacterRest,
  spendClassResource,
  recoverClassResource,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { CHARACTER_STATE_STALE_MS } from "@/features/character/characters/api/character-query";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

export function useCharacterState(characterId: string) {
  const { accessToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

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
    staleTime: CHARACTER_STATE_STALE_MS,
  });
}

function useInvalidateState(characterId: string) {
  const queryClient = useQueryClient();
  return (state: Awaited<ReturnType<typeof fetchCharacterState>>) => {
    queryClient.setQueryData(sessionKeys.state(characterId), state);
  };
}

export function usePatchCharacterState(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
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
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
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
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
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
      if (!result) return;
      setState(result.state);
      queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(characterId),
      });
    },
  });
}

export function useSpendClassResource(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const setState = useInvalidateState(characterId);

  return useMutation({
    mutationFn: async (payload: UseClassResourcePayload) => {
      try {
        return await spendClassResource(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      setState(result.state);
    },
  });
}

export function useRecoverClassResource(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const setState = useInvalidateState(characterId);

  return useMutation({
    mutationFn: async (payload: UseClassResourcePayload) => {
      try {
        return await recoverClassResource(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (state) => {
      if (state) setState(state);
    },
  });
}
