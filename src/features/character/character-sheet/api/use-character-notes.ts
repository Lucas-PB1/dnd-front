"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

import {
    characterNotesKeys,
    fetchCharacterNotes,
    saveCharacterNotes,
  } from "./character-notes.api";

  export function useCharacterNotes(characterId: string, enabled = true) {
    const { accessToken } = useGameAuth("/characters");
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: characterNotesKeys.detail(characterId),
        queryFn: () => {
          if (!accessToken) throw new Error("Não autenticado");
          return fetchCharacterNotes(accessToken, characterId);
        },
        enabled: enabled && !!accessToken && !!characterId,
        staleTime: 60_000,
      });

      const mutation = useMutation({
        mutationFn: (notes: string) => {
          if (!accessToken) throw new Error("Não autenticado");
          return saveCharacterNotes(accessToken, characterId, notes);
        },
        onSuccess: (updated) => {
          // Atualiza o cache local imediatamente
          queryClient.setQueryData(characterNotesKeys.detail(characterId), updated);
        },
      });

      return {
        notes: query.data?.notes ?? "",
        isLoading: query.isPending,
        saveNotes: mutation.mutateAsync,
        isSaving: mutation.isPending,
      };
    }