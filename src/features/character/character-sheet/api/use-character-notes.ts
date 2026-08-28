"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  characterNotesKeys,
  fetchCharacterNotes,
  saveCharacterNotes,
} from "./character-notes.api";

export function useCharacterNotes(characterId: string, enabled = true) {
  const { accessToken, requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: characterNotesKeys.detail(characterId),
    queryFn: async () => {
      try {
        return await fetchCharacterNotes(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: enabled && !!accessToken && !!characterId,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (notes: string) => {
      try {
        return await saveCharacterNotes(requireToken(), characterId, notes);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(characterNotesKeys.detail(characterId), updated);
    },
  });

  return {
    notes: query.data?.notes ?? "",
    isLoading: query.isPending,
    loadError: query.error,
    saveNotes: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}
