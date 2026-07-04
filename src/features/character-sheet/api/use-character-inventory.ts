"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AddInventoryItemPayload,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import {
  addInventoryItem,
  fetchCharacterInventory,
  inventoryKeys,
  patchInventoryItem,
  removeInventoryItem,
} from "@/features/character-sheet/api/character-inventory.api";
import { charactersKeys } from "@/features/characters/api/characters.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function useCharacterInventory(characterId: string) {
  const { accessToken, handleUnauthorized } = useGameAuth(characterId);

  return useQuery({
    queryKey: inventoryKeys.list(characterId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver o inventário");
      }
      try {
        return await fetchCharacterInventory(accessToken, characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: !!accessToken && !!characterId,
  });
}

function useInvalidateInventory(characterId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: inventoryKeys.list(characterId),
    });
    queryClient.invalidateQueries({
      queryKey: charactersKeys.detail(characterId),
    });
  };
}

export function useAddInventoryItem(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (payload: AddInventoryItemPayload) => {
      try {
        return await addInventoryItem(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}

export function usePatchInventoryItem(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async ({
      itemSlug,
      payload,
    }: {
      itemSlug: string;
      payload: PatchInventoryItemPayload;
    }) => {
      try {
        return await patchInventoryItem(
          requireToken(),
          characterId,
          itemSlug,
          payload,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}

export function useRemoveInventoryItem(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(characterId);
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (itemSlug: string) => {
      try {
        await removeInventoryItem(requireToken(), characterId, itemSlug);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}
