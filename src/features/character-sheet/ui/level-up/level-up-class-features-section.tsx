"use client";

import type { ClassOption } from "@/entities/character/sheet-types";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  LevelUpClassExpertiseSlot,
  LevelUpWeaponMasterySlot,
} from "@/entities/character/session-types";
import { useClassSubclasses } from "@/features/class-catalog/api/use-classes";
import {
  LevelUpClassExpertise,
} from "@/features/character-sheet/ui/level-up/level-up-class-expertise";
import {
  LevelUpWeaponMastery,
} from "@/features/character-sheet/ui/level-up/level-up-weapon-mastery";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";

type LevelUpClassFeaturesSectionProps = {
  character: CharacterDetail;
  subclassRequired: boolean;
  subclassUnlockLevel?: number;
  newSpellOptionsCount: number;
  newExpertiseSlots: LevelUpClassExpertiseSlot[];
  newMasterySlots: LevelUpWeaponMasterySlot[];
  subclassSlug: string;
  onSubclassChange: (slug: string) => void;
  classOptions: ClassOption[];
  onClassOptionsChange: (options: ClassOption[]) => void;
};

export function LevelUpClassFeaturesSection({
  character,
  subclassRequired,
  subclassUnlockLevel,
  newSpellOptionsCount,
  newExpertiseSlots,
  newMasterySlots,
  subclassSlug,
  onSubclassChange,
  classOptions,
  onClassOptionsChange,
}: LevelUpClassFeaturesSectionProps) {
  const subclasses = useClassSubclasses(character.classSlug, subclassRequired);

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

      {newSpellOptionsCount > 0 ? (
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          <span
            aria-hidden
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary tabular-nums"
          >
            {newSpellOptionsCount}
          </span>
          <div className="space-y-0.5">
            <p className="font-medium">Novas magias disponíveis</p>
            <p className="text-muted-foreground">
              Depois de subir de nível, escolha na aba{" "}
              <span className="font-medium text-foreground">Magias</span>.
            </p>
          </div>
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
