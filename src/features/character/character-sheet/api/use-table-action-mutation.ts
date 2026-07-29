"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  sessionKeys,
  type FighterTableActionResult,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

export type TableActionResult = FighterTableActionResult;

export function useTableActionMutation<TArgs>(
  characterId: string,
  execute: (
    token: string,
    id: string,
    args: TArgs,
  ) => Promise<TableActionResult>,
) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<TableActionResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (args: TArgs) => {
      try {
        return await execute(requireToken(), characterId, args);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      setLastResult(result);
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    lastResult,
    clearResult: () => setLastResult(null),
  };
}
