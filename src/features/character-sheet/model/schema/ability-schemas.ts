import { z } from "zod";

import { ABILITIES } from "@/entities/character-sheet/constants/abilities";
import { SKILL_DEFINITIONS } from "@/entities/character-sheet/constants/skills";

import {
  abilityScoreSchema,
  proficientModifierSchema,
  spellSlotSchema,
} from "@/features/character-sheet/model/schema/field-schemas";

function abilityRecordSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object(
    Object.fromEntries(ABILITIES.map((ability) => [ability, valueSchema])) as {
      strength: T;
      dexterity: T;
      constitution: T;
      intelligence: T;
      wisdom: T;
      charisma: T;
    },
  );
}

function skillRecordSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object(
    Object.fromEntries(
      SKILL_DEFINITIONS.map((skill) => [skill.key, valueSchema]),
    ) as Record<(typeof SKILL_DEFINITIONS)[number]["key"], T>,
  );
}

export const abilitiesSchema = abilityRecordSchema(abilityScoreSchema);
export const abilityBaseScoresSchema = abilityRecordSchema(z.string());
export const savingThrowsSchema = abilityRecordSchema(proficientModifierSchema);
export const skillsSchema = skillRecordSchema(proficientModifierSchema);

export const spellSlotsSchema = z.object({
  "1": spellSlotSchema,
  "2": spellSlotSchema,
  "3": spellSlotSchema,
  "4": spellSlotSchema,
  "5": spellSlotSchema,
  "6": spellSlotSchema,
  "7": spellSlotSchema,
  "8": spellSlotSchema,
  "9": spellSlotSchema,
});
