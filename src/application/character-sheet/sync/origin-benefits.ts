import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import { formatAbilityModifier } from "@/domain/character-sheet/ability-modifier";
import type { Ability } from "@/domain/character-sheet/constants";
import { ABILITIES } from "@/domain/character-sheet/constants";
import {
  findBackgroundDetails,
  getBackgroundAbilityBonuses,
  type BackgroundAbilityMode,
} from "@/domain/character-sheet/background-details";
import { findClassProficiencies } from "@/domain/character-sheet/class-proficiencies";
import {
  clearSpeciesSkillProficiency as clearSpeciesSkill,
  syncSpeciesSkillProficiency as syncSpeciesSkill,
} from "@/application/character-sheet/sync/species-benefits";

type SetCharacterSheetValue = UseFormSetValue<CharacterSheet>;
type WatchCharacterSheet = UseFormWatch<CharacterSheet>;

function parseScore(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function syncAbilityScoresWithOriginBonuses(
  setValue: SetCharacterSheetValue,
  watch: WatchCharacterSheet,
  backgroundId: string,
  mode: BackgroundAbilityMode,
  plus2: string,
  plus1: string,
): void {
  const bonuses = getBackgroundAbilityBonuses(backgroundId, mode, plus2, plus1);

  for (const ability of ABILITIES) {
    const base = parseScore(watch(`abilityBaseScores.${ability}`) ?? "");

    if (base == null) {
      continue;
    }

    const final = base + bonuses[ability];
    setValue(`abilities.${ability}.score`, String(final));
    setValue(
      `abilities.${ability}.modifier`,
      formatAbilityModifier(String(final)) ?? "",
    );
  }
}

export function setAbilityBaseScores(
  setValue: SetCharacterSheetValue,
  scores: Record<Ability, number>,
): void {
  for (const ability of ABILITIES) {
    setValue(`abilityBaseScores.${ability}`, String(scores[ability]));
  }
}

export function syncBackgroundSkillProficiencies(
  setValue: SetCharacterSheetValue,
  backgroundId: string,
): void {
  const definition = findBackgroundDetails(backgroundId);

  if (!definition) {
    return;
  }

  for (const skill of definition.skills) {
    setValue(`skills.${skill}.proficient`, true);
  }
}

export function clearBackgroundSkillProficiencies(
  setValue: SetCharacterSheetValue,
  backgroundId: string,
): void {
  const definition = findBackgroundDetails(backgroundId);

  if (!definition) {
    return;
  }

  for (const skill of definition.skills) {
    setValue(`skills.${skill}.proficient`, false);
  }
}

export function syncSpeciesSkillProficiency(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
): void {
  syncSpeciesSkill(setValue, speciesId, skillChoice);
}

export function clearSpeciesSkillProficiency(
  setValue: SetCharacterSheetValue,
  skillChoice: string,
  speciesId = "",
): void {
  clearSpeciesSkill(setValue, speciesId, skillChoice);
}

export function buildOriginFeatsText(
  backgroundId: string,
  speciesId: string,
  speciesOriginFeat: string,
): string {
  const parts: string[] = [];
  const background = findBackgroundDetails(backgroundId);

  if (background?.originFeat) {
    parts.push(background.originFeat);
  }

  if (speciesId === "human" && speciesOriginFeat.trim()) {
    parts.push(speciesOriginFeat.trim());
  }

  return parts.join("\n");
}

export function buildToolsText(classId: string, backgroundId: string): string {
  const parts: string[] = [];
  const classDefinition = findClassProficiencies(classId);
  const background = findBackgroundDetails(backgroundId);

  if (classDefinition?.toolsLabel) {
    parts.push(classDefinition.toolsLabel);
  }

  if (background?.toolsLabel) {
    parts.push(background.toolsLabel);
  }

  return parts.join(" · ");
}

export function resetBackgroundOriginOnChange(
  setValue: SetCharacterSheetValue,
  previousBackgroundId: string,
  nextBackgroundId: string,
  speciesId: string,
  speciesOriginFeat: string,
  classId: string,
): void {
  if (previousBackgroundId) {
    clearBackgroundSkillProficiencies(setValue, previousBackgroundId);
  }

  setValue("backgroundAbilityPlus2", "");
  setValue("backgroundAbilityPlus1", "");
  setValue("backgroundAbilityMode", "split");
  syncBackgroundSkillProficiencies(setValue, nextBackgroundId);
  setValue(
    "feats",
    buildOriginFeatsText(nextBackgroundId, speciesId, speciesOriginFeat),
  );
  setValue("tools", buildToolsText(classId, nextBackgroundId));
}
