"use client";

import { useEffect, useRef } from "react";

import {
  applyClassProficiencyBaseWithOrigin,
  resetClassProficienciesOnClassChange,
  syncClassSkillProficiencies,
  updateClassSkillChoices,
} from "@/application/character-sheet/apply-class-proficiencies";
import {
  syncBackgroundSkillProficiencies,
  syncSpeciesSkillProficiency,
} from "@/application/character-sheet/apply-origin-benefits";
import { findBackgroundDetails } from "@/domain/character-sheet/background-details";
import {
  ABILITIES,
  ABILITY_ABBREV,
  SKILL_DEFINITIONS,
} from "@/domain/character-sheet/constants";
import {
  findClassProficiencies,
  getClassSkillPool,
} from "@/domain/character-sheet/class-proficiencies";
import { findCharacterClass } from "@/domain/character-sheet/classes";
import { ABILITY_LABELS_PT, SKILL_LABELS_PT } from "@/shared/labels/pt-br";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { ToggleButtonGroup } from "@/presentation/components/character-sheet/toggle-button-group";
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
  const characterClass = watch("characterClass");
  const characterLevel = watch("characterLevel");
  const backgroundId = watch("background");
  const speciesId = watch("species");
  const speciesSkillChoice = watch("speciesSkillChoice");
  const classSkillChoices = watch("classSkillChoices");
  const classDefinition = findCharacterClass(characterClass);
  const proficiencies = characterClass
    ? findClassProficiencies(characterClass)
    : undefined;
  const backgroundDetails = backgroundId
    ? findBackgroundDetails(backgroundId)
    : undefined;
  const previousClassRef = useRef(characterClass);

  useEffect(() => {
    if (previousClassRef.current !== characterClass) {
      resetClassProficienciesOnClassChange(
        setValue,
        previousClassRef.current,
        characterClass,
        characterLevel,
        backgroundId,
      );
      previousClassRef.current = characterClass;
    } else {
      applyClassProficiencyBaseWithOrigin(
        setValue,
        characterClass,
        characterLevel,
        backgroundId,
      );
    }

    if (characterClass && classSkillChoices.length > 0) {
      syncClassSkillProficiencies(setValue, characterClass, classSkillChoices);
    }

    if (backgroundId) {
      syncBackgroundSkillProficiencies(setValue, backgroundId);
    }

    syncSpeciesSkillProficiency(setValue, speciesId, speciesSkillChoice);
  }, [
    backgroundId,
    characterClass,
    characterLevel,
    classSkillChoices,
    setValue,
    speciesId,
    speciesSkillChoice,
  ]);

  const skillOptions = proficiencies
    ? getClassSkillPool(proficiencies).map((skill) => ({
        id: skill,
        label: SKILL_LABELS_PT[skill],
      }))
    : [];

  return (
    <div className="flex flex-col gap-4">
      {!characterClass ? (
        <p className="text-sm text-muted-foreground">
          Escolha uma classe na etapa anterior para preencher salvaguardas e
          perícias automaticamente.
        </p>
      ) : null}

      {backgroundDetails ? (
        <SheetSection title="Proficiências do antecedente">
          <p className="mb-2 text-sm text-muted-foreground">
            Perícias e ferramentas do antecedente já aplicadas na ficha.
          </p>
          <p className="text-xs text-muted-foreground">
            {backgroundDetails.skills
              .map((skill) => SKILL_LABELS_PT[skill])
              .join(" · ")}{" "}
            · {backgroundDetails.toolsLabel}
          </p>
        </SheetSection>
      ) : null}

      {proficiencies && classDefinition ? (
        <SheetSection title="Proficiências da classe">
          <p className="mb-4 text-sm text-muted-foreground">
            {classDefinition.name}: salvaguardas, treinamento e bônus de
            proficiência aplicados pelo PHB 2024. Escolha{" "}
            {proficiencies.skillChoiceCount}{" "}
            {proficiencies.skillChoiceCount === 1 ? "perícia" : "perícias"}.
          </p>

          <ToggleButtonGroup
            label="Perícias da classe"
            options={skillOptions}
            selected={classSkillChoices}
            max={proficiencies.skillChoiceCount}
            onChange={(choices) =>
              updateClassSkillChoices(setValue, characterClass, choices)
            }
          />
        </SheetSection>
      ) : null}

      <SheetSection title="Salvaguardas">
        <div className="flex flex-col gap-2">
          {ABILITIES.map((ability) => (
            <SheetProficiencyRow
              key={ability}
              label={ABILITY_LABELS_PT[ability]}
              proficient={watch(`savingThrows.${ability}.proficient`)}
              onProficientChange={(value) =>
                setValue(`savingThrows.${ability}.proficient`, value)
              }
              modifierProps={register(`savingThrows.${ability}.modifier`)}
            />
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Perícias">
        <div className="flex flex-col gap-2">
          {SKILL_DEFINITIONS.map((skill) => (
            <SheetProficiencyRow
              key={skill.key}
              label={SKILL_LABELS_PT[skill.key]}
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

      <SheetSection title="Treinamento e proficiências">
        <div className="flex flex-col gap-3">
          <SheetTextarea
            label="Ferramentas"
            {...register("tools")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Armas"
            {...register("weaponsProficiency")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Armaduras"
            {...register("armorProficiency")}
            className="min-h-16"
          />
          <SheetTextarea
            label="Treinamento"
            {...register("training")}
            className="min-h-16"
          />
          <div className="flex flex-wrap gap-4 pt-1">
            <SheetCheckbox
              label="Leve"
              checked={watch("armorTrainingLight")}
              onChange={(value) => setValue("armorTrainingLight", value)}
            />
            <SheetCheckbox
              label="Média"
              checked={watch("armorTrainingMedium")}
              onChange={(value) => setValue("armorTrainingMedium", value)}
            />
            <SheetCheckbox
              label="Pesada"
              checked={watch("armorTrainingHeavy")}
              onChange={(value) => setValue("armorTrainingHeavy", value)}
            />
            <SheetCheckbox
              label="Escudos"
              checked={watch("armorTrainingShields")}
              onChange={(value) => setValue("armorTrainingShields", value)}
            />
          </div>
        </div>
      </SheetSection>
    </div>
  );
}
