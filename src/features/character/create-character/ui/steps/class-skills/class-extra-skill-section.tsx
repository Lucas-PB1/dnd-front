"use client";

import { isClassExtraSkillOptionKey } from "@/entities/character/lib/class-extra-skill-slots";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { filterClassOptionSlotSelectOptions } from "@/features/character/create-character/lib/class-skills/class-option-slot-select";

type ClassExtraSkillSectionProps = {
  extraSkillSlots: Array<{ optionKey: string; unlockLevel: number }>;
  extraSkillCandidates: Array<{ value: string; label: string }>;
  classOptions: CreateCharacterInput["classOptions"];
  extraSkillFilled: number;
  onSetExtraSkill: (optionKey: string, valueId: string) => void;
};

export function ClassExtraSkillSection({
  extraSkillSlots,
  extraSkillCandidates,
  classOptions,
  extraSkillFilled,
  onSetExtraSkill,
}: ClassExtraSkillSectionProps) {
  if (extraSkillSlots.length === 0) return null;

  return (
    <WizardFormSection
      title={`Conhecimento Primordial · ${extraSkillFilled}/${extraSkillSlots.length}`}
      compact
    >
      <p className="text-xs text-muted-foreground">
        Escolha uma perícia extra da lista do Bárbaro em que você ainda não é
        proficiente.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {extraSkillSlots.map((slot) => {
          const selected =
            classOptions.find((option) => option.optionKey === slot.optionKey)
              ?.valueId ?? "";
          const selectOptions = filterClassOptionSlotSelectOptions({
            candidates: extraSkillCandidates,
            classOptions,
            optionKey: slot.optionKey,
            selected,
            isMatchingOptionKey: isClassExtraSkillOptionKey,
          });
          return (
            <CatalogSelect
              key={slot.optionKey}
              id={slot.optionKey}
              label={`Perícia extra (nv. ${slot.unlockLevel})`}
              options={selectOptions}
              value={selected}
              onChange={(event) =>
                onSetExtraSkill(slot.optionKey, event.target.value)
              }
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
