"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  castCharacterSpell,
  executeClassTableAction,
  executeFeatTableAction,
  executeItemTableAction,
  executeTransformationTableAction,
  sessionKeys,
  spendClassResource,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  CAST_ITEM_FREE_TABLE_ACTION,
  ITEM_REMINDER_TABLE_ACTION,
  isArmTableAction,
  isPsiTableAction,
  SPEND_RESOURCE_TABLE_ACTION,
  isTransformationTableAction,
  wizardSlugFromArmTableAction,
  type EconomyTableAction,
} from "@/features/character/character-sheet/lib/combat/economy-table-actions";
import {
  ARTIFACT_RANDOM_CAST_TABLE_ACTION,
  ARTIFACT_REGEN_TABLE_ACTION,
} from "@/features/character/character-sheet/lib/combat/artifact-instance-actions";
import { inventoryKeys } from "@/features/character/character-sheet/api/character-inventory.api";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import {
  MAGIC_MISSILE_FREE_CAST_TABLE_ACTION,
  MAGIC_MISSILE_SPELL_SLUG,
} from "@/features/character/character-sheet/lib/combat/magic-missile-cast-boosts";
import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type EconomyTableActionResultNote = {
  note: string;
};

const MAGIC_MISSILE_FREE_RESOURCE = "magic-missile-free";

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

function classTableSpendFields(tableAction: string, spendAmount: number) {
  if (tableAction === "champion-of-the-gods" || tableAction === "healing-light") {
    return { diceCount: spendAmount };
  }
  if (tableAction === "restore-lunar-step") {
    return { slotLevel: spendAmount };
  }
  if (tableAction === "lay-on-hands") {
    return { amount: spendAmount };
  }
  if (tableAction === "bastion-of-law") {
    return { pointsSpent: spendAmount };
  }
  return {};
}

export function useEconomyTableAction(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableAction,
      classSlug,
      featSlug,
      usePsiDie = false,
      resourceSlug,
      spendAmount = 1,
      spellSlug,
      note,
      armed,
      itemSlug,
      actionId,
      enabled,
      mutationSlug,
      applyMissileShield,
      applyGigaMissile,
    }: {
      tableAction: EconomyTableAction;
      classSlug?: string | null;
      featSlug?: string | null;
      usePsiDie?: boolean;
      resourceSlug?: string;
      spendAmount?: number;
      spellSlug?: string;
      note?: string;
      armed?: boolean;
      itemSlug?: string | null;
      actionId?: string;
      enabled?: boolean;
      mutationSlug?: string | null;
      applyMissileShield?: boolean;
      applyGigaMissile?: boolean;
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

        const routeItem = itemSlug?.trim() || null;
        if (
          routeItem &&
          !(classSlug?.trim()) &&
          !(featSlug?.trim())
        ) {
          if (tableAction === SPEND_RESOURCE_TABLE_ACTION && spellSlug) {
            if (!resourceSlug) {
              throw new Error("Recurso não definido para esta ação");
            }
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
          const itemActionSlug = actionId?.trim() || tableAction;
          const result = await executeItemTableAction(token, characterId, {
            itemSlug: routeItem,
            actionSlug: itemActionSlug,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          void queryClient.invalidateQueries({
            queryKey: inventoryKeys.list(characterId),
          });
          void queryClient.invalidateQueries({
            queryKey: charactersKeys.detail(characterId),
          });
          return noteFromResult(result, note);
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
          void queryClient.invalidateQueries({
            queryKey: charactersKeys.detail(characterId),
          });
          return {
            note: (
              result.note?.trim() ||
              note?.trim() ||
              `Gastou ${spendAmount}× ${resourceSlug}`
            ).trim(),
          };
        }

        if (tableAction === MAGIC_MISSILE_FREE_CAST_TABLE_ACTION) {
          const result = await castCharacterSpell(token, characterId, {
            spellSlug: MAGIC_MISSILE_SPELL_SLUG,
            freeCastResourceSlug: MAGIC_MISSILE_FREE_RESOURCE,
            applyMissileShield,
            applyGigaMissile,
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
          const result = await executeClassTableAction(
            token,
            characterId,
            "wizard",
            wizardSlugFromArmTableAction(tableAction, Boolean(armed)),
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return { note: result.note };
        }

        if (isTransformationTableAction(tableAction)) {
          const result = await executeTransformationTableAction(
            token,
            characterId,
            {
              actionSlug: tableAction,
              ...(mutationSlug !== undefined ? { mutationSlug } : {}),
            },
          );
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          return noteFromResult(result, note);
        }

        const routeFeat = featSlug?.trim() || null;
        if (routeFeat && !(classSlug?.trim())) {
          const result = await executeFeatTableAction(token, characterId, {
            featSlug: routeFeat,
            actionSlug: tableAction,
            itemSlug: itemSlug?.trim() || undefined,
            enabled,
          });
          queryClient.setQueryData(sessionKeys.state(characterId), result.state);
          if (tableAction === "artisan-craft") {
            void queryClient.invalidateQueries({
              queryKey: inventoryKeys.list(characterId),
            });
          }
          return noteFromResult(result, note);
        }

        const routeClass = classSlug?.trim() || null;
        if (!routeClass) {
          throw new Error(
            `Ação de mesa sem classSlug/featSlug no catálogo: ${tableAction}`,
          );
        }

        const result = await executeClassTableAction(token, characterId, routeClass, {
          actionSlug: tableAction,
          usePsiDie:
            routeClass === "rogue" || isPsiTableAction(tableAction)
              ? usePsiDie
              : undefined,
          ...classTableSpendFields(tableAction, spendAmount),
        });
        queryClient.setQueryData(sessionKeys.state(characterId), result.state);
        return noteFromResult(result, note);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });
}
