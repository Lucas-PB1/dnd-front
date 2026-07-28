"use client";

import { ArrowUpCircleIcon, LanguageIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import { BeyondActionsTab } from "@/features/character-sheet/ui/beyond/beyond-actions-tab";
import type { BeyondTabId } from "@/features/character-sheet/ui/beyond/beyond-main-tabs";
import { BeyondInventoryTab } from "@/features/character-sheet/ui/beyond/beyond-inventory-tab";
import { BeyondSpellsTab } from "@/features/character-sheet/ui/beyond/beyond-spells-tab";
import { BeyondTraitsTab } from "@/features/character-sheet/ui/beyond/beyond-traits-tab";
import { CharacterSheetTabSection } from "@/features/character-sheet/ui/character-sheet-tab-section";
import { SheetEditButton } from "@/features/character-sheet/ui/character-sheet-header";
import { LevelUpSection } from "@/features/character-sheet/ui/level-up-section";
import { LanguagesSection } from "@/features/character-sheet/ui/sheet-read-sections";
import type { SheetEditId } from "@/features/character-sheet/lib/sheet-edit-types";

type CharacterSheetTabPanelsProps = {
  characterId: string;
  character: CharacterDetail;
  labels: ReturnType<typeof useCharacterCatalogLabels>;
  sectionProps: {
    character: CharacterDetail;
    labels: ReturnType<typeof useCharacterCatalogLabels>;
  };
  onEdit: (editId: NonNullable<SheetEditId>) => void;
  onEdit: (editId: NonNullable<SheetEditId>) => void;
};

export function buildCharacterSheetTabPanels({
  characterId,
  character,
  labels,
  sectionProps,
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
    settings: (
      <div className="space-y-5">
        <CharacterSheetTabSection title="Subir de nível" icon={ArrowUpCircleIcon}>
          <LevelUpSection characterId={characterId} character={character} />
        </CharacterSheetTabSection>
        <CharacterSheetTabSection
          title="Idiomas"
          icon={LanguageIcon}
          action={<SheetEditButton editId="languages" onEdit={onEdit} />}
        >
          <LanguagesSection {...sectionProps} />
        </CharacterSheetTabSection>
      </div>
    ),
  };
}
