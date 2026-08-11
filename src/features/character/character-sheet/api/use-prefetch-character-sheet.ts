"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/model";
import {
  CHARACTER_DETAIL_STALE_MS,
  CHARACTER_INVENTORY_STALE_MS,
  CHARACTER_STATE_STALE_MS,
} from "@/features/character/characters/api/character-query";
import {
  charactersKeys,
  fetchCharacterById,
} from "@/features/character/characters/api/characters.api";
import {
  fetchCharacterInventory,
  inventoryKeys,
} from "@/features/character/character-sheet/api/character-inventory.api";
import {
  fetchCharacterState,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";

/**
 * Prefetch do detalhe + estado (hover/focus na lista) para abrir a ficha quente.
 */
export function usePrefetchCharacterSheet() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useCallback(
    (characterId: string) => {
      if (!accessToken || !characterId) return;

      void queryClient.prefetchQuery({
        queryKey: charactersKeys.detail(characterId),
        queryFn: () => fetchCharacterById(accessToken, characterId),
        staleTime: CHARACTER_DETAIL_STALE_MS,
      });

      void queryClient.prefetchQuery({
        queryKey: sessionKeys.state(characterId),
        queryFn: () => fetchCharacterState(accessToken, characterId),
        staleTime: CHARACTER_STATE_STALE_MS,
      });
    },
    [accessToken, queryClient],
  );
}

/**
 * Na ficha: dispara estado + inventário em paralelo com o detalhe
 * (não espera o combate/strip ou a aba montarem).
 */
export function useWarmCharacterSheetQueries(characterId: string) {
  const queryClient = useQueryClient();
  const { accessToken, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !accessToken || !characterId) return;

    void queryClient.prefetchQuery({
      queryKey: sessionKeys.state(characterId),
      queryFn: () => fetchCharacterState(accessToken, characterId),
      staleTime: CHARACTER_STATE_STALE_MS,
    });

    void queryClient.prefetchQuery({
      queryKey: inventoryKeys.list(characterId),
      queryFn: () => fetchCharacterInventory(accessToken, characterId),
      staleTime: CHARACTER_INVENTORY_STALE_MS,
    });
  }, [accessToken, authLoading, characterId, queryClient]);
}
