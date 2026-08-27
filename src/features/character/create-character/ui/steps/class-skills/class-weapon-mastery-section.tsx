"use client";

import {
  isClassWeaponMasteryOptionKey,
  type WeaponMasteryEligibility,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import { filterClassOptionSlotSelectOptions } from "@/features/character/create-character/lib/class-skills/class-option-slot-select";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { ChoicePreviewPanel } from "@/features/character/create-character/ui/choice-preview-panel";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type WeaponMasteryCandidate = {
  value: string;
  label: string;
  hint?: string;
  masteryName?: string | null;
  masteryDescription?: string | null;
};

type ClassWeaponMasterySectionProps = {
  masterySlots: Array<{ optionKey: string; unlockLevel: number }>;
  masteryCandidates: WeaponMasteryCandidate[];
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
      <div className="grid gap-3 sm:grid-cols-2">
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
          const selectedCandidate = masteryCandidates.find(
            (candidate) => candidate.value === selected,
          );
          return (
            <div key={slot.optionKey} className="space-y-1.5">
              <CatalogSelect
                id={slot.optionKey}
                label={`Maestria (nv. ${slot.unlockLevel})`}
                options={selectOptions}
                value={selected}
                onChange={(event) =>
                  onSetMasteryWeapon(slot.optionKey, event.target.value)
                }
              />
              {selectedCandidate?.masteryDescription ? (
                <ChoicePreviewPanel
                  title={selectedCandidate.masteryName ?? selectedCandidate.label}
                  subtitle="Maestria em arma"
                  teaser={selectedCandidate.masteryDescription}
                  detailText={selectedCandidate.masteryDescription}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </WizardFormSection>
  );
}
