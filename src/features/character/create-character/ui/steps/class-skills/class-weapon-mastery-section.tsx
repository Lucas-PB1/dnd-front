"use client";

import {
  isClassWeaponMasteryOptionKey,
  type WeaponMasteryEligibility,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import { filterClassOptionSlotSelectOptions } from "@/features/character/create-character/lib/class-skills/class-option-slot-select";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type ClassWeaponMasterySectionProps = {
  masterySlots: Array<{ optionKey: string; unlockLevel: number }>;
  masteryCandidates: Array<{ value: string; label: string }>;
  classOptions: CreateCharacterInput["classOptions"];
  masteryFilled: number;
  masteryEligibility: WeaponMasteryEligibility | null;
  onSetMasteryWeapon: (optionKey: string, valueId: string) => void;
};

export function ClassWeaponMasterySection({
  masterySlots,
  masteryCandidates,
  classOptions,
  masteryFilled,
  masteryEligibility,
  onSetMasteryWeapon,
}: ClassWeaponMasterySectionProps) {
  if (masterySlots.length === 0) return null;

  return (
    <WizardFormSection
      title={`Maestria em Arma · ${masteryFilled}/${masterySlots.length}`}
      compact
    >
      <p className="text-xs text-muted-foreground">
        Escolha tipos de arma cuja propriedade de maestria você pode usar
        {masteryEligibility === "melee"
          ? " (corpo a corpo)"
          : masteryEligibility === "ranged"
            ? " (à distância)"
            : ""}
        .
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {masterySlots.map((slot) => {
          const selected =
            classOptions.find((option) => option.optionKey === slot.optionKey)
              ?.valueId ?? "";
          const selectOptions = filterClassOptionSlotSelectOptions({
            candidates: masteryCandidates,
            classOptions,
            optionKey: slot.optionKey,
            selected,
            isMatchingOptionKey: isClassWeaponMasteryOptionKey,
          });
          return (
            <CatalogSelect
              key={slot.optionKey}
              id={slot.optionKey}
              label={`Maestria (nv. ${slot.unlockLevel})`}
              options={selectOptions}
              value={selected}
              onChange={(event) =>
                onSetMasteryWeapon(slot.optionKey, event.target.value)
              }
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
