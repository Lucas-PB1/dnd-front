"use client";

import type { ClassOption, SubclassOption } from "@/entities/character/sheet-types";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  LevelUpClassExpertiseSlot,
  LevelUpSubclassOptionSlot,
  LevelUpWeaponMasterySlot,
} from "@/entities/character/session-types";
import { useClassSubclasses } from "@/features/catalog/class-catalog/api/use-classes";
import {
  LevelUpClassExpertise,
} from "@/features/character/character-sheet/ui/level-up/level-up-class-expertise";
import {
  LevelUpWeaponMastery,
} from "@/features/character/character-sheet/ui/level-up/level-up-weapon-mastery";
import {
  SubclassOptionsEditor,
} from "@/features/character/character-sheet/ui/level-up/subclass-options-editor";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";

type LevelUpClassFeaturesSectionProps = {
  character: CharacterDetail;
  subclassRequired: boolean;
  subclassUnlockLevel?: number;
  newSubclassOptionSlots: LevelUpSubclassOptionSlot[];
  newExpertiseSlots: LevelUpClassExpertiseSlot[];
  newMasterySlots: LevelUpWeaponMasterySlot[];
  subclassSlug: string;
  onSubclassChange: (slug: string) => void;
  classOptions: ClassOption[];
  onClassOptionsChange: (options: ClassOption[]) => void;
  subclassOptions: SubclassOption[];
  onSubclassOptionsChange: (options: SubclassOption[]) => void;
  nextLevel: number;
};

/** Editores de escolha do level-up (o que ganha fica em LevelUpUnlocksPanel). */
export function LevelUpClassFeaturesSection({
  character,
  subclassRequired,
  subclassUnlockLevel,
  newSubclassOptionSlots,
  newExpertiseSlots,
  newMasterySlots,
  subclassSlug,
  onSubclassChange,
  classOptions,
  onClassOptionsChange,
  subclassOptions,
  onSubclassOptionsChange,
  nextLevel,
}: LevelUpClassFeaturesSectionProps) {
  const subclasses = useClassSubclasses(character.classSlug, subclassRequired);
  const subclassOptionKeys = newSubclassOptionSlots.map(
    (slot) => slot.optionKey,
  );

  return (
    <>
      {subclassRequired ? (
        <CatalogSelect
          id="level-up-subclass"
          label="Subclasse"
          description={
            subclassUnlockLevel
              ? `Obrigatória no nível ${subclassUnlockLevel}.`
              : undefined
          }
          isLoading={subclasses.isPending}
          options={(subclasses.data?.data ?? []).map((subclass) => ({
            value: subclass.slug,
            label: subclass.name,
          }))}
          value={subclassSlug}
          onChange={(event) => onSubclassChange(event.target.value)}
        />
      ) : null}

      {newSubclassOptionSlots.length > 0 ? (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          <div className="space-y-0.5">
            <p className="font-medium">Escolhas de subclasse neste nível</p>
            <p className="text-muted-foreground">
              Complete as opções listadas acima antes de subir.
            </p>
          </div>
          <SubclassOptionsEditor
            character={character}
            optionsLevel={nextLevel}
            optionKeys={subclassOptionKeys}
            value={subclassOptions}
            onChange={onSubclassOptionsChange}
          />
        </div>
      ) : null}

      {newExpertiseSlots.length > 0 ? (
        <LevelUpClassExpertise
          character={character}
          newSlots={newExpertiseSlots}
          value={classOptions}
          onChange={onClassOptionsChange}
        />
      ) : null}

      {newMasterySlots.length > 0 ? (
        <LevelUpWeaponMastery
          character={character}
          newSlots={newMasterySlots}
          value={classOptions}
          onChange={onClassOptionsChange}
        />
      ) : null}
    </>
  );
}
