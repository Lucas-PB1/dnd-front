import type { Ability } from "@/domain/character-sheet/constants";
import {
  ABILITIES,
  SKILL_DEFINITIONS,
  type SkillKey,
} from "@/domain/character-sheet/constants";
import { PHB_2024_CLASS_PROFICIENCIES } from "@/domain/character-sheet/data/classes/proficiencies/index";
import type { ClassProficienciesDefinition } from "@/domain/character-sheet/types/class";

export function findClassProficiencies(
  classId: string,
): ClassProficienciesDefinition | undefined {
  return PHB_2024_CLASS_PROFICIENCIES.find((entry) => entry.id === classId);
}

export function getClassSkillPool(
  definition: ClassProficienciesDefinition,
): SkillKey[] {
  if (definition.skillChoices === "any") {
    return SKILL_DEFINITIONS.map((skill) => skill.key);
  }

  return [...definition.skillChoices];
}

export function getProficiencyBonus(level: string): string {
  const numericLevel = Number.parseInt(level, 10);

  if (!Number.isFinite(numericLevel) || numericLevel < 1) {
    return "";
  }

  return String(Math.floor((numericLevel - 1) / 4) + 2);
}

export function formatClassHitDice(hitDie: string, level: string): string {
  const numericLevel = Number.parseInt(level, 10);

  if (!Number.isFinite(numericLevel) || numericLevel < 1) {
    return "";
  }

  return `${numericLevel}${hitDie}`;
}

export function isValidClassSkillSelection(
  definition: ClassProficienciesDefinition,
  selected: readonly string[],
): boolean {
  const pool = getClassSkillPool(definition);

  if (selected.length !== definition.skillChoiceCount) {
    return false;
  }

  return selected.every((skill) => pool.includes(skill as SkillKey));
}

export function getSavingThrowAbilities(classId: string): Ability[] {
  const definition = findClassProficiencies(classId);
  return definition ? [...definition.savingThrows] : [];
}

export function allSavingThrowPaths(): `savingThrows.${Ability}.proficient`[] {
  return ABILITIES.map((ability) => `savingThrows.${ability}.proficient`);
}
