import type { UseFormSetValue } from "react-hook-form";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import { ABILITIES, type SkillKey } from "@/domain/character-sheet/constants";
import {
  findClassProficiencies,
  formatClassHitDice,
  getClassSkillPool,
  getProficiencyBonus,
} from "@/domain/character-sheet/class-proficiencies";
import { buildToolsText } from "@/application/character-sheet/apply-origin-benefits";

type SetCharacterSheetValue = UseFormSetValue<CharacterSheet>;

export function applyClassProficiencyBase(
  setValue: SetCharacterSheetValue,
  classId: string,
  level: string,
): void {
  const definition = findClassProficiencies(classId);

  if (!definition) {
    return;
  }

  for (const ability of ABILITIES) {
    const proficient = definition.savingThrows.includes(ability);
    setValue(`savingThrows.${ability}.proficient`, proficient);
  }

  setValue("weaponsProficiency", definition.weaponsLabel);
  setValue("armorProficiency", definition.armorLabel);
  setValue("tools", definition.toolsLabel ?? "");
  setValue("armorTrainingLight", definition.armorTraining.light);
  setValue("armorTrainingMedium", definition.armorTraining.medium);
  setValue("armorTrainingHeavy", definition.armorTraining.heavy);
  setValue("armorTrainingShields", definition.armorTraining.shields);
  setValue("proficiencyBonus", getProficiencyBonus(level));
  setValue("hitDice", formatClassHitDice(definition.hitDie, level));
}

export function applyClassProficiencyBaseWithOrigin(
  setValue: SetCharacterSheetValue,
  classId: string,
  level: string,
  backgroundId: string,
): void {
  applyClassProficiencyBase(setValue, classId, level);
  setValue("tools", buildToolsText(classId, backgroundId));
}

export function syncClassSkillProficiencies(
  setValue: SetCharacterSheetValue,
  classId: string,
  selected: readonly string[],
): void {
  const definition = findClassProficiencies(classId);

  if (!definition) {
    return;
  }

  const pool = getClassSkillPool(definition);
  const selectedSet = new Set(selected);

  for (const skill of pool) {
    setValue(`skills.${skill}.proficient`, selectedSet.has(skill));
  }
}

export function clearClassSkillProficiencies(
  setValue: SetCharacterSheetValue,
  classId: string,
): void {
  const definition = findClassProficiencies(classId);

  if (!definition) {
    return;
  }

  for (const skill of getClassSkillPool(definition)) {
    setValue(`skills.${skill}.proficient`, false);
  }
}

export function resetClassProficienciesOnClassChange(
  setValue: SetCharacterSheetValue,
  previousClassId: string,
  nextClassId: string,
  level: string,
  backgroundId: string,
): void {
  if (previousClassId) {
    clearClassSkillProficiencies(setValue, previousClassId);
  }

  setValue("classSkillChoices", []);
  applyClassProficiencyBaseWithOrigin(
    setValue,
    nextClassId,
    level,
    backgroundId,
  );
}

export function updateClassSkillChoices(
  setValue: SetCharacterSheetValue,
  classId: string,
  choices: SkillKey[],
): void {
  setValue("classSkillChoices", choices);
  syncClassSkillProficiencies(setValue, classId, choices);
}
