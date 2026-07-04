import type { CreateCharacterPayload } from "@/entities/character/types";
import { SUBCLASS_UNLOCK_LEVEL_DEFAULT } from "@/entities/character/lib/subclass";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";

export function toCreateCharacterPayload(
  values: CreateCharacterInput,
): CreateCharacterPayload {
  const includeSubclass = values.level >= SUBCLASS_UNLOCK_LEVEL_DEFAULT;

  const payload: CreateCharacterPayload = {
    name: values.name,
    level: values.level,
    classSlug: values.classSlug,
    speciesSlug: values.speciesSlug,
    backgroundSlug: values.backgroundSlug,
    abilityScores: values.abilityScores,
    abilityGenerationMethodSlug: values.abilityGenerationMethodSlug,
    classSkillSlugs: values.classSkillSlugs,
    backgroundAbilityBoostPlus2Slug: values.backgroundAbilityBoostPlus2Slug,
    backgroundAbilityBoostPlus1Slug: values.backgroundAbilityBoostPlus1Slug,
  };

  if (values.backgroundToolItemSlug?.trim()) {
    payload.backgroundToolItemSlug = values.backgroundToolItemSlug.trim();
  }

  if (includeSubclass && values.subclassSlug?.trim()) {
    payload.subclassSlug = values.subclassSlug;
  }
  if (values.speciesChoices.length > 0) {
    payload.speciesChoices = values.speciesChoices;
  }
  if (values.subclassOptions.length > 0) {
    payload.subclassOptions = values.subclassOptions;
  }
  if (values.equipment.length > 0) {
    payload.equipment = values.equipment;
  }
  if (values.characterSpells.length > 0) {
    payload.characterSpells = values.characterSpells;
  }
  if (values.featOptions.length > 0) {
    payload.featOptions = values.featOptions;
  }

  return payload;
}
