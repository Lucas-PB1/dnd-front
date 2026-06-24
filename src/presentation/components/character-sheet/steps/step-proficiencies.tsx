"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
  SKILL_DEFINITIONS,
} from "@/domain/character-sheet/constants";
import {
  SheetCheckbox,
  SheetProficiencyRow,
  SheetSection,
  SheetTextarea,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepProficiencies({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Saving Throws">
        <div className="flex flex-col gap-2">
          {ABILITIES.map((ability) => (
            <SheetProficiencyRow
              key={ability}
              label={ABILITY_LABELS[ability]}
              proficient={watch(`savingThrows.${ability}.proficient`)}
              onProficientChange={(value) =>
                setValue(`savingThrows.${ability}.proficient`, value)
              }
              modifierProps={register(`savingThrows.${ability}.modifier`)}
            />
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Skills">
        <div className="flex flex-col gap-2">
          {SKILL_DEFINITIONS.map((skill) => (
            <SheetProficiencyRow
              key={skill.key}
              label={skill.label}
              abilityAbbrev={ABILITY_ABBREV[skill.ability]}
              proficient={watch(`skills.${skill.key}.proficient`)}
              onProficientChange={(value) =>
                setValue(`skills.${skill.key}.proficient`, value)
              }
              modifierProps={register(`skills.${skill.key}.modifier`)}
            />
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Equipment Training & Proficiencies">
        <div className="flex flex-col gap-3">
          <SheetTextarea
            label="Tools"
            {...register("tools")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Weapons"
            {...register("weaponsProficiency")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Armor"
            {...register("armorProficiency")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Training"
            {...register("training")}
            className="min-h-16"
          />
          <div className="flex flex-wrap gap-4 pt-1">
            <SheetCheckbox
              label="Light"
              checked={watch("armorTrainingLight")}
              onChange={(value) => setValue("armorTrainingLight", value)}
            />
            <SheetCheckbox
              label="Medium"
              checked={watch("armorTrainingMedium")}
              onChange={(value) => setValue("armorTrainingMedium", value)}
            />
            <SheetCheckbox
              label="Heavy"
              checked={watch("armorTrainingHeavy")}
              onChange={(value) => setValue("armorTrainingHeavy", value)}
            />
            <SheetCheckbox
              label="Shields"
              checked={watch("armorTrainingShields")}
              onChange={(value) => setValue("armorTrainingShields", value)}
            />
          </div>
        </div>
      </SheetSection>
    </div>
  );
}
