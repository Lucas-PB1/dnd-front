"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  castCharacterSpell,
  executeFighterTableAction,
  executePaladinTableAction,
  executeRangerTableAction,
  executeRogueTableAction,
  executeSorcererTableAction,
  executeWarlockTableAction,
  executeWizardTableAction,
  sessionKeys,
  spendClassResource,
  type FighterTableActionSlug,
  type PaladinTableActionSlug,
  type RangerTableActionSlug,
  type RogueTableActionSlug,
  type SorcererTableActionSlug,
  type WarlockTableActionSlug,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  isArmTableAction,
  isPsiTableAction,
  SPEND_RESOURCE_TABLE_ACTION,
  wizardSlugFromArmTableAction,
  type EconomyTableAction,
} from "@/features/character/character-sheet/lib/combat/economy-table-actions";

export type EconomyTableActionResultNote = {
  note: string;
};

const MAGIC_MISSILE_SPELL_SLUG = "misseis-magicos";
const MAGIC_MISSILE_FREE_RESOURCE = "magic-missile-free";
const MAGIC_MISSILE_FREE_CAST = "cast:misseis-magicos-free";

type SessionNoteResult = {
  state: unknown;
  note?: string | null;
  total?: number;
  expression?: string | null;
};

function noteFromResult(
  result: SessionNoteResult,
  fallbackNote?: string,
): EconomyTableActionResultNote {
  if (result.note?.trim()) {
    return { note: result.note.trim() };
  }
  if (result.total != null) {
    return {
      note: `${result.expression ?? ""} → ${result.total}`.trim(),
    };
  }
  return { note: fallbackNote?.trim() ?? "" };
}

/**
 * Executa a ação de mesa ligada a uma linha de economia (Usar).
 * Roteia por `classSlug` do catálogo (+ protocolos cast/arm/spend-resource).
 */
export function useEconomyTableAction(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableAction,
      classSlug,
      usePsiDie = false,
      resourceSlug,
      spendAmount = 1,
      note,
      armed,
    }: {
      tableAction: EconomyTableAction;
      /** `economyActions[].classSlug` — obrigatório para slugs de classe. */
      classSlug?: string | null;
      usePsiDie?: boolean;
      resourceSlug?: string;
      spendAmount?: number;
      note?: string;
      /** Para arm:* — se true, desarma em vez de armar. */
      armed?: boolean;
    }): Promise<EconomyTableActionResultNote> => {
      const token = requireToken();
      try {
        if (tableAction === SPEND_RESOURCE_TABLE_ACTION) {
          if (!resourceSlug) {
            throw new Error("Recurso não definido para esta ação");
          }
          const result = await spendClassResource(token, characterId, {
            resourceSlug,
            amount: spendAmount,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (
              note?.trim() || `Gastou ${spendAmount}× ${resourceSlug}`
            ).trim(),
          };
        }

        if (tableAction === MAGIC_MISSILE_FREE_CAST) {
          const result = await castCharacterSpell(token, characterId, {
            spellSlug: MAGIC_MISSILE_SPELL_SLUG,
            freeCastResourceSlug: MAGIC_MISSILE_FREE_RESOURCE,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (
              result.note?.trim() ||
              note?.trim() ||
              "Mísseis Mágicos conjurados."
            ).trim(),
          };
        }

        if (isArmTableAction(tableAction)) {
          const slug = wizardSlugFromArmTableAction(
            tableAction,
            Boolean(armed),
          ) as WizardTableActionSlug;
          const result = await executeWizardTableAction(
            token,
            characterId,
            slug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }

        const routeClass = classSlug?.trim() || null;
        if (!routeClass) {
          throw new Error(
            `Ação de mesa sem classSlug no catálogo: ${tableAction}`,
          );
        }

        if (routeClass === "fighter") {
          const result = await executeFighterTableAction(token, characterId, {
            actionSlug: tableAction as FighterTableActionSlug,
            usePsiDie: isPsiTableAction(tableAction) ? usePsiDie : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }

        if (routeClass === "ranger") {
          const result = await executeRangerTableAction(token, characterId, {
            actionSlug: tableAction as RangerTableActionSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "paladin") {
          const result = await executePaladinTableAction(token, characterId, {
            actionSlug: tableAction as PaladinTableActionSlug,
            amount:
              tableAction === "lay-on-hands" ? spendAmount : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "rogue") {
          const result = await executeRogueTableAction(token, characterId, {
            actionSlug: tableAction as RogueTableActionSlug,
            usePsiDie,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "sorcerer") {
          const result = await executeSorcererTableAction(token, characterId, {
            actionSlug: tableAction as SorcererTableActionSlug,
            pointsSpent:
              tableAction === "bastion-of-law" ? spendAmount : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "warlock") {
          const result = await executeWarlockTableAction(token, characterId, {
            actionSlug: tableAction as WarlockTableActionSlug,
            diceCount:
              tableAction === "healing-light" ? spendAmount : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "wizard") {
          const result = await executeWizardTableAction(
            token,
            characterId,
            tableAction as WizardTableActionSlug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        throw new Error(
          `Classe sem routing de economia Usar: ${routeClass} (${tableAction})`,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });
}
