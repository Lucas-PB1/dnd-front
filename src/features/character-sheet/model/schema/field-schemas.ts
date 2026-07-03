import { z } from "zod";

export const abilityScoreSchema = z.object({
  score: z.string(),
  modifier: z.string(),
});

export const proficientModifierSchema = z.object({
  proficient: z.boolean(),
  modifier: z.string(),
});

export const weaponRowSchema = z.object({
  name: z.string(),
  atkBonus: z.string(),
  damage: z.string(),
  notes: z.string(),
});

export const spellRowSchema = z.object({
  name: z.string(),
  level: z.string(),
  castingTime: z.string(),
  range: z.string(),
  concentration: z.boolean(),
  ritual: z.boolean(),
  material: z.string(),
  notes: z.string(),
});

export const spellSlotSchema = z.object({
  total: z.string(),
  expended: z.string(),
});

export const magicItemRowSchema = z.object({
  name: z.string(),
  attuned: z.boolean(),
});

export type AbilityScore = z.infer<typeof abilityScoreSchema>;
export type ProficientModifier = z.infer<typeof proficientModifierSchema>;
export type WeaponRow = z.infer<typeof weaponRowSchema>;
export type SpellRow = z.infer<typeof spellRowSchema>;
export type SpellSlot = z.infer<typeof spellSlotSchema>;
export type MagicItemRow = z.infer<typeof magicItemRowSchema>;
