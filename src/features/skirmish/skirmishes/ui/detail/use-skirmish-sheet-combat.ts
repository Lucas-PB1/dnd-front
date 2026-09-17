"use client";

import { useMemo } from "react";

import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { useCharacterInventory } from "@/features/character/character-sheet/api/use-character-inventory";
import { useCharacterState } from "@/features/character/character-sheet/api/use-character-state";
import { resolveEconomyActionsForCharacter } from "@/features/character/character-sheet/lib/combat/resolve-economy-actions-for-character";
import { useCharacterDetail } from "@/features/character/characters/api/use-character-detail";

export function useSkirmishSheetCombat(characterId: string) {
  const characterQuery = useCharacterDetail(characterId);
  const stateQuery = useCharacterState(characterId);
  const inventoryQuery = useCharacterInventory(characterId);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug: characterQuery.data?.classSlug,
    subclassSlug: characterQuery.data?.subclassSlug,
  });
  const character = characterQuery.data;
  const economyActions = useMemo(() => {
    if (!character) return [];
    return resolveEconomyActionsForCharacter({
      character,
      catalog: mechanicalCatalog.data?.economyActions ?? [],
      inventoryItems: inventoryQuery.data?.items,
    });
  }, [
    character,
    mechanicalCatalog.data?.economyActions,
    inventoryQuery.data?.items,
  ]);

  return {
    characterQuery,
    stateQuery,
    inventoryQuery,
    mechanicalCatalog,
    character,
    economyActions,
  };
}
