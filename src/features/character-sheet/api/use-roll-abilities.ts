"use client";

import { useMutation } from "@tanstack/react-query";

import {
  rollAbilities,
  type RollAbilitiesPayload,
} from "@/features/character-sheet/api/character-build.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

export function useRollAbilities() {
  const { requireToken, handleUnauthorized } = useGameAuth("/characters/new");

  return useMutation({
    mutationFn: async (payload: RollAbilitiesPayload) => {
      const accessToken = requireToken("Faça login para gerar atributos");
      try {
        return await rollAbilities(accessToken, payload);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });
}
