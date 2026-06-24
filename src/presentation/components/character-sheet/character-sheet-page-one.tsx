"use client";

import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import { formatAbilityModifier } from "@/domain/character-sheet/ability-modifier";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
  SKILL_DEFINITIONS,
  WEAPON_ROW_COUNT,
} from "@/domain/character-sheet/constants";
import { Input } from "@/components/ui/input";
import {
  DeathSaveTracker,
  SheetCheckbox,
  SheetInput,
  SheetProficiencyRow,
  SheetSection,
  SheetTextarea,
} from "@/presentation/components/character-sheet/sheet-primitives";

type PageOneProps = {
  register: UseFormRegister<CharacterSheet>;
  watch: UseFormWatch<CharacterSheet>;
  setValue: UseFormSetValue<CharacterSheet>;
};

export function CharacterSheetPageOne({
  register,
  watch,
  setValue,
}: PageOneProps) {
  const deathSaveSuccesses = watch("deathSaveSuccesses");
  const deathSaveFailures = watch("deathSaveFailures");

  function handleAbilityScoreBlur(ability: (typeof ABILITIES)[number]) {
    const score = watch(`abilities.${ability}.score`);
    const modifier = formatAbilityModifier(score);

    if (modifier !== null) {
      setValue(`abilities.${ability}.modifier`, modifier);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
      <SheetSection
        id="sheet-identity"
        title="Identidade"
        className="lg:col-span-3"
      >
        <div className="flex flex-col gap-3">
          <SheetInput
            label="Character Name"
            className="text-lg font-semibold"
            placeholder="Nome do herói"
            autoFocus
            {...register("characterName")}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <SheetInput label="Species" {...register("species")} />
            <SheetInput label="Class & Level" {...register("classLevel")} />
            <SheetInput label="Subclass" {...register("subclass")} />
            <SheetInput label="XP" {...register("experiencePoints")} />
            <SheetInput label="Background" {...register("background")} />
            <SheetInput label="Alignment" {...register("alignment")} />
          </div>
        </div>
      </SheetSection>

      <div className="flex flex-col gap-4">
        <SheetSection id="sheet-abilities" title="Abilities">
          <p className="mb-3 text-xs text-muted-foreground">
            Ao sair do campo de score, o modificador é calculado automaticamente
            (pode editar depois).
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ABILITIES.map((ability) => (
              <div
                key={ability}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 transition-colors focus-within:border-primary/40"
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {ABILITY_ABBREV[ability]}
                </span>
                <Input
                  className="h-10 text-center text-lg font-semibold"
                  placeholder="10"
                  inputMode="numeric"
                  {...register(`abilities.${ability}.score`)}
                  onBlur={() => handleAbilityScoreBlur(ability)}
                />
                <Input
                  className="h-8 text-center text-sm"
                  placeholder="+0"
                  {...register(`abilities.${ability}.modifier`)}
                />
                <span className="text-[10px] text-muted-foreground">
                  {ABILITY_LABELS[ability]}
                </span>
              </div>
            ))}
          </div>
        </SheetSection>

        <SheetSection id="sheet-saving-throws" title="Saving Throws">
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

        <SheetSection
          id="sheet-skills"
          title="Skills"
          collapsible
          defaultOpen={false}
        >
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
      </div>

      <div className="flex flex-col gap-4">
        <SheetSection id="sheet-combat" title="Combat">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SheetInput
              label="Armor Class"
              {...register("armorClass")}
              compact
            />
            <SheetInput
              label="Initiative"
              {...register("initiative")}
              compact
            />
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

        <SheetSection id="sheet-hit-points" title="Hit Points">
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

      <div className="flex flex-col gap-4">
        <SheetSection title="Feats" collapsible defaultOpen={false}>
          <SheetTextarea {...register("feats")} className="min-h-24" />
        </SheetSection>

        <SheetSection title="Class Features" collapsible defaultOpen={false}>
          <SheetTextarea {...register("classFeatures")} className="min-h-32" />
        </SheetSection>

        <SheetSection title="Species Traits">
          <SheetTextarea {...register("speciesTraits")} className="min-h-24" />
        </SheetSection>

        <SheetSection
          id="sheet-weapons"
          title="Weapons & Damage"
          collapsible
          defaultOpen
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Name</th>
                  <th className="pb-2 pr-2 font-medium">Atk / DC</th>
                  <th className="pb-2 pr-2 font-medium">Damage & Type</th>
                  <th className="pb-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: WEAPON_ROW_COUNT }).map((_, index) => (
                  <tr key={index} className="border-b border-border/60">
                    <td className="py-1.5 pr-2">
                      <Input
                        className="h-7 text-xs"
                        {...register(`weapons.${index}.name`)}
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <Input
                        className="h-7 text-xs"
                        {...register(`weapons.${index}.atkBonus`)}
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <Input
                        className="h-7 text-xs"
                        {...register(`weapons.${index}.damage`)}
                      />
                    </td>
                    <td className="py-1.5">
                      <Input
                        className="h-7 text-xs"
                        {...register(`weapons.${index}.notes`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SheetSection>

        <SheetSection title="Cantrips">
          <SheetTextarea {...register("cantrips")} className="min-h-20" />
        </SheetSection>
      </div>
    </div>
  );
}
