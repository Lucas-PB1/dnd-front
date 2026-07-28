"use client";

import { isClassExpertiseOptionKey } from "@/entities/character/lib/class-expertise-slots";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/create-character/ui/wizard/wizard-form-section";
import { filterClassOptionSlotSelectOptions } from "@/features/create-character/lib/class-skills/class-option-slot-select";

type ClassExpertiseSectionProps = {
  expertiseSlots: Array<{ optionKey: string; unlockLevel: number }>;
  expertiseCandidates: Array<{ value: string; label: string }>;
  classOptions: CreateCharacterInput["classOptions"];
  expertiseFilled: number;
  onSetExpertise: (optionKey: string, valueId: string) => void;
};

export function ClassExpertiseSection({
  expertiseSlots,
  expertiseCandidates,
  classOptions,
  expertiseFilled,
  onSetExpertise,
}: ClassExpertiseSectionProps) {
  if (expertiseSlots.length === 0) return null;

  return (
    <WizardFormSection
      title={`Especialização · ${expertiseFilled}/${expertiseSlots.length}`}
      compact
    >
      <p className="text-xs text-muted-foreground">
        Escolha perícias nas quais você já é proficiente (×2 PB).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {expertiseSlots.map((slot) => {
          const selected =
            classOptions.find((option) => option.optionKey === slot.optionKey)
              ?.valueId ?? "";
          const selectOptions = filterClassOptionSlotSelectOptions({
            candidates: expertiseCandidates,
            classOptions,
            optionKey: slot.optionKey,
            selected,
            isMatchingOptionKey: isClassExpertiseOptionKey,
          });
          return (
            <CatalogSelect
              key={slot.optionKey}
              id={slot.optionKey}
              label={`Especialização (nv. ${slot.unlockLevel})`}
              options={selectOptions}
              value={selected}
              onChange={(event) =>
                onSetExpertise(slot.optionKey, event.target.value)
              }
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
