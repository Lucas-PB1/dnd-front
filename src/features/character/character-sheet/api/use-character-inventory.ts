"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AddInventoryItemPayload,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import {
  addInventoryItem,
  attachCoverage,
  attachWeaponCharm,
  detachCoverage,
  detachWeaponCharm,
  fetchCharacterInventory,
  inventoryKeys,
  patchInventoryItem,
  removeInventoryItem,
} from "@/features/character/character-sheet/api/character-inventory.api";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

export function useCharacterInventory(characterId: string) {
  const { accessToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

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
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
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
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
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
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
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

export function useAttachWeaponCharm(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (payload: {
      weaponSlug: string;
      charmSlug: string;
    }) => {
      try {
        return await attachWeaponCharm(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}

export function useDetachWeaponCharm(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (weaponSlug: string) => {
      try {
        return await detachWeaponCharm(requireToken(), characterId, {
          weaponSlug,
        });
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}

export function useAttachCoverage(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (payload: {
      baseItemSlug: string;
      coverageSlug: string;
      bonus?: 1 | 2 | 3;
      spellSlug?: string;
    }) => {
      try {
        return await attachCoverage(requireToken(), characterId, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}

export function useDetachCoverage(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const invalidate = useInvalidateInventory(characterId);

  return useMutation({
    mutationFn: async (baseItemSlug: string) => {
      try {
        return await detachCoverage(requireToken(), characterId, {
          baseItemSlug,
        });
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidate,
  });
}
