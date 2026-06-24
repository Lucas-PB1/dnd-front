"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  DeathSaveTracker,
  SheetCheckbox,
  SheetInput,
  SheetSection,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepCombat({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const deathSaveSuccesses = watch("deathSaveSuccesses");
  const deathSaveFailures = watch("deathSaveFailures");

  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Combat">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SheetInput label="Armor Class" {...register("armorClass")} compact />
          <SheetInput label="Initiative" {...register("initiative")} compact />
          <SheetInput label="Speed" {...register("speed")} compact />
          <SheetInput label="Size" {...register("size")} compact />
          <SheetInput
            label="Passive Perception"
            {...register("passivePerception")}
            compact
          />
          <SheetInput
            label="Proficiency Bonus"
            {...register("proficiencyBonus")}
            compact
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <SheetCheckbox
            label="Heroic Inspiration"
            checked={watch("heroicInspiration")}
            onChange={(value) => setValue("heroicInspiration", value)}
          />
          <SheetInput
            label="Shield"
            {...register("shield")}
            compact
            className="max-w-32"
          />
        </div>
      </SheetSection>

      <SheetSection title="Hit Points">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SheetInput label="Max" {...register("hitPointsMax")} compact />
          <SheetInput
            label="Current"
            {...register("hitPointsCurrent")}
            compact
          />
          <SheetInput label="Temp" {...register("hitPointsTemp")} compact />
          <SheetInput label="Hit Dice" {...register("hitDice")} compact />
        </div>
        <div className="mt-3">
          <SheetInput
            label="Hit Dice Spent"
            {...register("hitDiceSpent")}
            compact
          />
        </div>
      </SheetSection>

      <SheetSection title="Death Saves">
        <DeathSaveTracker
          successes={deathSaveSuccesses}
          failures={deathSaveFailures}
          onSuccessesChange={(value) => setValue("deathSaveSuccesses", value)}
          onFailuresChange={(value) => setValue("deathSaveFailures", value)}
        />
      </SheetSection>
    </div>
  );
}
