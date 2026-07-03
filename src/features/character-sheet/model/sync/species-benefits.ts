import type { UseFormSetValue } from "react-hook-form";

import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";
import { buildOriginFeatsText } from "@/features/character-sheet/model/sync/origin-benefits";
import type { SkillKey } from "@/entities/character-sheet/constants";
import { getSpeciesSheetDefaults } from "@/entities/character-sheet/species-details";
import {
  formatSpeciesTraitsForSheet,
  getSpeciesSkillChoicePool,
  isValidSpeciesSkillChoice,
  speciesHasOriginFeatChoice,
} from "@/entities/character-sheet/species-trait-choices";

type SetCharacterSheetValue = UseFormSetValue<CharacterSheet>;

export function syncSpeciesTraitsText(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
  originFeat: string,
): void {
  if (!speciesId) {
    setValue("speciesTraits", "");
    return;
  }

  setValue(
    "speciesTraits",
    formatSpeciesTraitsForSheet(speciesId, {
      skillChoice,
      originFeat,
    }),
  );
}

export function syncSpeciesSkillProficiency(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
): void {
  if (!speciesId || !isValidSpeciesSkillChoice(speciesId, skillChoice)) {
    return;
  }

  setValue(`skills.${skillChoice as SkillKey}.proficient`, true);
}

export function clearSpeciesSkillProficiency(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
): void {
  if (!skillChoice) {
    return;
  }

  const pool = getSpeciesSkillChoicePool(speciesId);
  if (!pool.includes(skillChoice as SkillKey)) {
    return;
  }

  setValue(`skills.${skillChoice as SkillKey}.proficient`, false);
}

export function applySpeciesSelection(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
  originFeat: string,
  backgroundId: string,
): void {
  const defaults = getSpeciesSheetDefaults(speciesId);

  if (defaults) {
    setValue("speed", defaults.speed);
    setValue("size", defaults.size);
  }

  syncSpeciesTraitsText(setValue, speciesId, skillChoice, originFeat);
  syncSpeciesSkillProficiency(setValue, speciesId, skillChoice);
  setValue("feats", buildOriginFeatsText(backgroundId, speciesId, originFeat));
}

export function resetSpeciesSelection(
  setValue: SetCharacterSheetValue,
  previousSpeciesId: string,
  previousSkillChoice: string,
  nextSpeciesId: string,
  backgroundId: string,
): { skillChoice: string; originFeat: string } {
  if (previousSpeciesId && previousSkillChoice) {
    clearSpeciesSkillProficiency(
      setValue,
      previousSpeciesId,
      previousSkillChoice,
    );
  }

  const originFeat = speciesHasOriginFeatChoice(nextSpeciesId)
    ? "Habilidoso"
    : "";

  setValue("speciesSkillChoice", "");
  setValue("speciesOriginFeat", originFeat);
  applySpeciesSelection(setValue, nextSpeciesId, "", originFeat, backgroundId);

  return { skillChoice: "", originFeat };
}

export function syncAllSpeciesBenefits(
  setValue: SetCharacterSheetValue,
  speciesId: string,
  skillChoice: string,
  originFeat: string,
  backgroundId: string,
): void {
  if (!speciesId) {
    return;
  }

  const defaults = getSpeciesSheetDefaults(speciesId);
  if (defaults) {
    setValue("speed", defaults.speed);
    setValue("size", defaults.size);
  }

  syncSpeciesTraitsText(setValue, speciesId, skillChoice, originFeat);
  syncSpeciesSkillProficiency(setValue, speciesId, skillChoice);
  setValue("feats", buildOriginFeatsText(backgroundId, speciesId, originFeat));
}
