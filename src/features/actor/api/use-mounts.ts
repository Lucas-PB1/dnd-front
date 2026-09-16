"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MountSheetActionPayload } from "@/entities/actor/mount-sheet";
import { actorKeys } from "@/features/actor/api/use-actors";
import {
  boardCharacterMount,
  linkCharacterMount,
  postMountSheetAction,
} from "@/features/actor/api/mounts.api";
import { syncCharacterTransportCaches } from "@/features/actor/api/sync-character-transport-caches";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

export function useLinkMount(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (payload: {
      itemSlug?: string;
      templateSlug?: string;
    }) => {
      try {
        return await linkCharacterMount(
          requireToken(),
          characterId,
          payload,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: actorKeys.byCharacter(characterId),
      });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(characterId),
      });
    },
  });
}

export function useBoardMount(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (actorId: string | null) => {
      try {
        return await boardCharacterMount(requireToken(), characterId, {
          actorId,
        });
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      syncCharacterTransportCaches(
        queryClient,
        characterId,
        result.boardedActorId,
        result.boardedActorId,
      );
    },
  });
}

export function useMountSheetAction(characterId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  return useMutation({
    mutationFn: async (payload: MountSheetActionPayload) => {
      try {
        return await postMountSheetAction(
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
        payload.actorId ?? result.boardedActorId,
      );
    },
  });
}
