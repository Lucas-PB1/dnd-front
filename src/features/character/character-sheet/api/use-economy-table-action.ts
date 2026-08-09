"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  castCharacterSpell,
  executeFighterTableAction,
  executeSorcererTableAction,
  executeWarlockTableAction,
  executeWizardTableAction,
  sessionKeys,
  spendClassResource,
  type FighterTableActionSlug,
  type SorcererTableActionSlug,
  type WarlockTableActionSlug,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  isPsiTableAction,
  type EconomyTableAction,
} from "@/features/character/character-sheet/lib/combat/economy-table-actions";

export type EconomyTableActionResultNote = {
  note: string;
};

const MAGIC_MISSILE_SPELL_SLUG = "misseis-magicos";
const MAGIC_MISSILE_FREE_RESOURCE = "magic-missile-free";

const FIGHTER_ECONOMY_TABLE_ACTIONS = new Set<string>([
  "second-wind",
  "action-surge",
  "tactical-mind",
]);

const SORCERER_ECONOMY_TABLE_ACTIONS = new Set<string>([
  "tides-of-chaos",
  "bastion-of-law",
  "restore-balance",
  "dragon-wings",
  "bend-luck",
  "heroic-soul",
  "mystical-maneuver",
  "innate-sorcery",
  "sorcerous-restoration",
  "warp-implosion",
]);

const WARLOCK_ECONOMY_TABLE_ACTIONS = new Set<string>([
  "magical-cunning",
  "healing-light",
  "searing-vengeance",
  "dark-ones-luck",
  "fey-step-effect",
  "awakened-mind",
  "fiendish-resilience",
  "hurl-through-hell",
  "beguiling-defenses",
  "clairvoyant-combatant",
]);

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
      resourceSlug,
      spendAmount = 1,
      note,
      armed,
    }: {
      tableAction: EconomyTableAction;
      usePsiDie?: boolean;
      resourceSlug?: string;
      spendAmount?: number;
      note?: string;
      /** Para arm:* — se true, desarma em vez de armar. */
      armed?: boolean;
    }): Promise<EconomyTableActionResultNote> => {
      const token = requireToken();
      try {
        if (
          FIGHTER_ECONOMY_TABLE_ACTIONS.has(tableAction) ||
          isPsiTableAction(tableAction)
        ) {
          const result = await executeFighterTableAction(token, characterId, {
            actionSlug: tableAction as FighterTableActionSlug,
            usePsiDie: isPsiTableAction(tableAction) ? usePsiDie : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        if (SORCERER_ECONOMY_TABLE_ACTIONS.has(tableAction)) {
          const result = await executeSorcererTableAction(
            token,
            characterId,
            {
              actionSlug: tableAction as SorcererTableActionSlug,
              pointsSpent:
                tableAction === "bastion-of-law" ? spendAmount : undefined,
            },
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note ?? note?.trim() ?? "" };
        }
        if (WARLOCK_ECONOMY_TABLE_ACTIONS.has(tableAction)) {
          const result = await executeWarlockTableAction(token, characterId, {
            actionSlug: tableAction as WarlockTableActionSlug,
            diceCount:
              tableAction === "healing-light" ? spendAmount : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note:
              result.note ??
              (result.total != null
                ? `${result.expression ?? ""} → ${result.total}`.trim()
                : note?.trim() ?? ""),
          };
        }
        if (tableAction === "cast:misseis-magicos-free") {
          const result = await castCharacterSpell(token, characterId, {
            spellSlug: MAGIC_MISSILE_SPELL_SLUG,
            freeCastResourceSlug: MAGIC_MISSILE_FREE_RESOURCE,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (result.note?.trim() || note?.trim() || "Mísseis Mágicos conjurados.").trim(),
          };
        }
        if (tableAction === "arm:missile-shield") {
          const slug = (
            armed ? "disarm-missile-shield" : "arm-missile-shield"
          ) as WizardTableActionSlug;
          const result = await executeWizardTableAction(
            token,
            characterId,
            slug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        if (tableAction === "arm:giga-missile") {
          const slug = (
            armed ? "disarm-giga-missile" : "arm-giga-missile"
          ) as WizardTableActionSlug;
          const result = await executeWizardTableAction(
            token,
            characterId,
            slug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }
        if (tableAction === "spend-resource") {
          if (!resourceSlug) {
            throw new Error("Recurso não definido para esta ação");
          }
          const result = await spendClassResource(token, characterId, {
            resourceSlug,
            amount: spendAmount,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (note?.trim() || `Gastou ${spendAmount}× ${resourceSlug}`).trim(),
          };
        }
        throw new Error(`Ação de mesa não suportada: ${tableAction}`);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });
}
