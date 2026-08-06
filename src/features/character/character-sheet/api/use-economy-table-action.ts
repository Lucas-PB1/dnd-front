"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activateActionSurge,
  activateSecondWind,
  applyTacticalMind,
  executePsiWarriorAction,
  sessionKeys,
  type PsiWarriorActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  isPsiTableAction,
  psiSlugFromTableAction,
  type EconomyTableAction,
} from "@/features/character/character-sheet/lib/combat/economy-table-actions";

export type EconomyTableActionResultNote = {
  note: string;
};

/**
 * Executa a ação de mesa ligada a uma linha de economia (Usar).
 */
export function useEconomyTableAction(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableAction,
      usePsiDie = false,
    }: {
      tableAction: EconomyTableAction;
      usePsiDie?: boolean;
    }): Promise<EconomyTableActionResultNote> => {
      const token = requireToken();
      try {
        if (tableAction === "second-wind") {
          const result = await activateSecondWind(token, characterId);
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note:
              `Recuperar Fôlego: ${result.expression} → +${result.healAmount} PV` +
              (result.note ? ` · ${result.note}` : ""),
          };
        }
        if (tableAction === "action-surge") {
          const result = await activateActionSurge(token, characterId);
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        if (tableAction === "tactical-mind") {
          const result = await applyTacticalMind(token, characterId);
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        if (isPsiTableAction(tableAction)) {
          const actionSlug = psiSlugFromTableAction(
            tableAction,
          ) as PsiWarriorActionSlug;
          const result = await executePsiWarriorAction(
            token,
            characterId,
            actionSlug,
            usePsiDie,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        throw new Error(`Ação de mesa não suportada: ${tableAction}`);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });
}
