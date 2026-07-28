"use client";

import type { ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { BeyondActionsTab } from "@/features/character/character-sheet/ui/beyond/layout/beyond-actions-tab";
import type { BeyondTabId } from "@/features/character/character-sheet/ui/beyond/layout/beyond-main-tabs";
import { BeyondInventoryTab } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-inventory-tab";
import { BeyondSpellsTab } from "@/features/character/character-sheet/ui/beyond/spells/beyond-spells-tab";
import { BeyondTraitsTab } from "@/features/character/character-sheet/ui/beyond/layout/beyond-traits-tab";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";

type CharacterSheetTabPanelsProps = {
  characterId: string;
  character: CharacterDetail;
  labels: ReturnType<typeof useCharacterCatalogLabels>;
  onEdit: (editId: NonNullable<SheetEditId>) => void;
};

export function buildCharacterSheetTabPanels({
  characterId,
  character,
  labels,
  onEdit,
}: CharacterSheetTabPanelsProps): Record<BeyondTabId, ReactNode> {
  return {
    actions: <BeyondActionsTab character={character} />,
    spells: (
      <BeyondSpellsTab
        characterId={characterId}
        character={character}
        labels={labels}
        onEdit={() => onEdit("spells")}
        cannotCastSpellsInArmor={Boolean(character.cannotCastSpellsInArmor)}
      />
    ),
    inventory: (
      <BeyondInventoryTab
        characterId={characterId}
        equipmentWarnings={character.equipmentWarnings}
      />
    ),
    features: (
      <BeyondTraitsTab
        character={character}
        labels={labels}
        onEdit={(section) => {
          if (section === "background") onEdit("background-tool");
          else onEdit(section);
        }}
      />
    ),
  };
}
