"use client";

import type { ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { BeyondActionsTab } from "@/features/character/character-sheet/ui/beyond/layout/beyond-actions-tab";
import { BeyondInventoryTab } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-inventory-tab";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { BeyondSpellsTab } from "@/features/character/character-sheet/ui/beyond/spells/beyond-spells-tab";
import { BeyondTraitsTab } from "@/features/character/character-sheet/ui/beyond/layout/beyond-traits-tab";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";
import { BoltIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export type CharacterSheetPageSectionId =
  | "actions"
  | "spells"
  | "inventory"
  | "features";

type CharacterSheetPagePanelsProps = {
  characterId: string;
  character: CharacterDetail;
  labels: ReturnType<typeof useCharacterCatalogLabels>;
  onEdit: (editId: NonNullable<SheetEditId>) => void;
};

export function buildCharacterSheetPagePanels({
  characterId,
  character,
  labels,
  onEdit,
}: CharacterSheetPagePanelsProps): Record<
  CharacterSheetPageSectionId,
  ReactNode
> {
  return {
    actions: (
      <BeyondPanel title="Ações" icon={BoltIcon} className="bg-card/70">
        <BeyondActionsTab character={character} />
      </BeyondPanel>
    ),
    spells: (
      <BeyondPanel flush className="bg-card/70">
        <div className="p-3.5 sm:p-4">
          <BeyondSpellsTab
            characterId={characterId}
            character={character}
            labels={labels}
            onEdit={() => onEdit("spells")}
            cannotCastSpellsInArmor={Boolean(character.cannotCastSpellsInArmor)}
          />
        </div>
      </BeyondPanel>
    ),
    inventory: (
      <BeyondPanel flush className="bg-card/70">
        <div className="p-3.5 sm:p-4">
          <BeyondInventoryTab
            characterId={characterId}
            equipmentWarnings={character.equipmentWarnings}
          />
        </div>
      </BeyondPanel>
    ),
    features: (
      <BeyondPanel
        title="Traços & escolhas"
        icon={BookOpenIcon}
        className="bg-card/70"
        flush
      >
        <div className="p-3">
          <BeyondTraitsTab
            character={character}
            labels={labels}
            onEdit={(section) => {
              if (section === "background") onEdit("background-tool");
              else onEdit(section);
            }}
          />
        </div>
      </BeyondPanel>
    ),
  };
}
