"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  castCharacterSpell,
  executeBarbarianTableAction,
  executeBardTableAction,
  executeClericTableAction,
  executeDruidTableAction,
  executeFighterTableAction,
  executeGunslingerTableAction,
  executeMonkTableAction,
  executePaladinTableAction,
  executeRangerTableAction,
  executeRogueTableAction,
  executeSorcererTableAction,
  executeWarlockTableAction,
  executeWizardTableAction,
  executeMonsterHunterTableAction,
  sessionKeys,
  spendClassResource,
  type BarbarianTableActionSlug,
  type BardTableActionSlug,
  type ClericTableActionSlug,
  type DruidTableActionSlug,
  type FighterTableActionSlug,
  type GunslingerTableActionSlug,
  type MonkTableActionSlug,
  type PaladinTableActionSlug,
  type RangerTableActionSlug,
  type RogueTableActionSlug,
  type SorcererTableActionSlug,
  type WarlockTableActionSlug,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  CAST_ITEM_FREE_TABLE_ACTION,
  ITEM_REMINDER_TABLE_ACTION,
  isArmTableAction,
  isPsiTableAction,
  SPEND_RESOURCE_TABLE_ACTION,
  wizardSlugFromArmTableAction,
  type EconomyTableAction,
} from "@/features/character/character-sheet/lib/combat/economy-table-actions";
import {
  ARTIFACT_RANDOM_CAST_TABLE_ACTION,
  ARTIFACT_REGEN_TABLE_ACTION,
} from "@/features/character/character-sheet/lib/combat/artifact-instance-actions";
import { inventoryKeys } from "@/features/character/character-sheet/api/character-inventory.api";
import { gameFetch } from "@/shared/api/dnd-api/api-client";

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
      spellSlug,
      note,
      armed,
      itemSlug,
    }: {
      tableAction: EconomyTableAction;
      /** `economyActions[].classSlug` — obrigatório para slugs de classe. */
      classSlug?: string | null;
      usePsiDie?: boolean;
      resourceSlug?: string;
      spendAmount?: number;
      /** Cast de item (fase 6) quando tableAction = spend-resource. */
      spellSlug?: string;
      note?: string;
      /** Para arm:* — se true, desarma em vez de armar. */
      armed?: boolean;
      /** Cast gratuito de item (cast-item-free). */
      itemSlug?: string | null;
    }): Promise<EconomyTableActionResultNote> => {
      const token = requireToken();
      try {
        if (tableAction === CAST_ITEM_FREE_TABLE_ACTION) {
          if (!spellSlug || !itemSlug) {
            throw new Error(
              "Magia ou item não definidos para conjuração gratuita",
            );
          }
          const result = await castCharacterSpell(token, characterId, {
            spellSlug,
            itemCastItemSlug: itemSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (
              result.note?.trim() ||
              note?.trim() ||
              `Conjurou ${spellSlug}`
            ).trim(),
          };
        }

        if (tableAction === ARTIFACT_RANDOM_CAST_TABLE_ACTION) {
          if (!spellSlug || !itemSlug || !resourceSlug) {
            throw new Error(
              "Magia/item/prop não definidos para cast de artefato",
            );
          }
          const [bucket, indexRaw] = resourceSlug.split(":");
          const index = Number(indexRaw);
          if (
            (bucket !== "minorBeneficial" &&
              bucket !== "majorBeneficial" &&
              bucket !== "minorDetrimental" &&
              bucket !== "majorDetrimental") ||
            !Number.isFinite(index)
          ) {
            throw new Error("Prop de artefato inválida");
          }
          const result = await castCharacterSpell(token, characterId, {
            spellSlug,
            artifactRandomCast: {
              itemSlug,
              bucket,
              index,
            },
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          void queryClient.invalidateQueries({
            queryKey: inventoryKeys.list(characterId),
          });
          return {
            note: (
              result.note?.trim() ||
              note?.trim() ||
              `Conjurou ${spellSlug} (artefato)`
            ).trim(),
          };
        }

        if (tableAction === ARTIFACT_REGEN_TABLE_ACTION) {
          if (!itemSlug) {
            throw new Error("Item não definido para regeneração de artefato");
          }
          const result = await gameFetch<{
            note: string;
            hitPointsCurrent: number;
          }>(`/characters/${characterId}/inventory/actions`, token, {
            method: "POST",
            body: JSON.stringify({
              actionSlug: "artifact-regen",
              itemSlug,
            }),
          });
          void queryClient.invalidateQueries({
            queryKey: sessionKeys.state(characterId),
          });
          void queryClient.invalidateQueries({
            queryKey: inventoryKeys.list(characterId),
          });
          void queryClient.invalidateQueries({
            queryKey: ["characters", characterId],
          });
          return { note: result.note?.trim() || "Regeneração do artefato" };
        }

        if (tableAction === ITEM_REMINDER_TABLE_ACTION) {
          return {
            note: (note?.trim() || "Lembrete de item").trim(),
          };
        }

        if (tableAction === SPEND_RESOURCE_TABLE_ACTION) {
          if (!resourceSlug) {
            throw new Error("Recurso não definido para esta ação");
          }
          if (spellSlug) {
            const result = await castCharacterSpell(token, characterId, {
              spellSlug,
              itemCastResourceSlug: resourceSlug,
              itemCastSpendAmount: spendAmount,
            });
            queryClient.setQueryData(sessionKeys.state(characterId), result.state);
            return {
              note: (
                result.note?.trim() ||
                note?.trim() ||
                `Conjurou ${spellSlug}`
              ).trim(),
            };
          }
          const result = await spendClassResource(token, characterId, {
            resourceSlug,
            amount: spendAmount,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return {
            note: (
              result.note?.trim() ||
              note?.trim() ||
              `Gastou ${spendAmount}× ${resourceSlug}`
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

        if (routeClass === "gunslinger") {
          const result = await executeGunslingerTableAction(token, characterId, {
            actionSlug: tableAction as GunslingerTableActionSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "ranger") {
          const result = await executeRangerTableAction(token, characterId, {
            actionSlug: tableAction as RangerTableActionSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "monk") {
          const result = await executeMonkTableAction(
            token,
            characterId,
            tableAction as MonkTableActionSlug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "cleric") {
          const result = await executeClericTableAction(
            token,
            characterId,
            tableAction as ClericTableActionSlug,
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "bard") {
          const result = await executeBardTableAction(token, characterId, {
            actionSlug: tableAction as BardTableActionSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "barbarian") {
          const result = await executeBarbarianTableAction(token, characterId, {
            actionSlug: tableAction as BarbarianTableActionSlug,
            diceCount:
              tableAction === "champion-of-the-gods" ? spendAmount : undefined,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        if (routeClass === "druid") {
          const result = await executeDruidTableAction(token, characterId, {
            actionSlug: tableAction as DruidTableActionSlug,
            slotLevel:
              tableAction === "restore-lunar-step" ? spendAmount : undefined,
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

        if (routeClass === "monster-hunter") {
          const result = await executeMonsterHunterTableAction(
            token,
            characterId,
            tableAction,
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
