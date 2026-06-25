import type { SkillKey } from "@/domain/character-sheet/constants/skills";
import type { SetCharacterSheetValue } from "@/shared/form/sheet-form.types";

export function setSkillsProficiency(
  setValue: SetCharacterSheetValue,
  skills: readonly SkillKey[],
  proficient: boolean,
): void {
  for (const skill of skills) {
    setValue(`skills.${skill}.proficient`, proficient);
  }
}

export function syncSkillsFromSelection(
  setValue: SetCharacterSheetValue,
  pool: readonly SkillKey[],
  selected: readonly string[],
): void {
  const selectedSet = new Set(selected);

  for (const skill of pool) {
    setValue(`skills.${skill}.proficient`, selectedSet.has(skill));
  }
}
