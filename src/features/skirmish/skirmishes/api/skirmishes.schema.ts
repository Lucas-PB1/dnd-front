import { z } from "zod";

const isoDateSchema = z.string().min(1);
const uuidSchema = z.string().uuid();

export const skirmishStatusSchema = z.enum(["active", "finished"]);
export const skirmishWinnerKindSchema = z.enum(["pc", "actor"]);
export const skirmishAdvantageSchema = z.enum([
  "normal",
  "advantage",
  "disadvantage",
]);
export const skirmishWeaponModeSchema = z.enum(["melee", "ranged"]);

export const skirmishCombatantSchema = z.object({
  id: uuidSchema,
  kind: z.enum(["pc", "actor"]),
  characterId: uuidSchema.nullable(),
  actorId: uuidSchema.nullable(),
  displayName: z.string().min(1),
  initiativeTotal: z.number().int().nullable(),
  initiativeModifier: z.number().int().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isCurrentTurn: z.boolean(),
  armorClass: z.number().int().nullable(),
  hpCurrent: z.number().int().nullable(),
  hpMax: z.number().int().nullable(),
  conditions: z.array(z.string()),
});

export const skirmishWeaponOptionSchema = z.object({
  itemSlug: z.string().min(1),
  mode: skirmishWeaponModeSchema,
});

export const skirmishLogEntrySchema = z.object({
  at: isoDateSchema,
  text: z.string().min(1),
});

export const skirmishSummarySchema = z.object({
  id: uuidSchema,
  status: skirmishStatusSchema,
  characterId: uuidSchema,
  characterName: z.string().min(1),
  opponentName: z.string().nullable(),
  round: z.number().int(),
  winnerKind: skirmishWinnerKindSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const skirmishSpellOptionSchema = z.object({
  spellSlug: z.string().min(1),
  listType: z.string().min(1),
});

export const skirmishFighterPanelSchema = z.object({
  available: z.boolean(),
  attacksPerAction: z.number().int(),
  turnAttacksRemaining: z.number().int().nullable(),
  secondWindRemaining: z.number().int(),
  secondWindMax: z.number().int(),
  actionSurgeRemaining: z.number().int(),
  actionSurgeMax: z.number().int(),
});

export const skirmishDetailSchema = skirmishSummarySchema.extend({
  combatants: z.array(skirmishCombatantSchema),
  currentCombatantId: uuidSchema.nullable(),
  myTurn: z.boolean(),
  turnAttacksRemaining: z.number().int().nullable(),
  myWeapons: z.array(skirmishWeaponOptionSchema),
  mySpells: z.array(skirmishSpellOptionSchema),
  fighter: skirmishFighterPanelSchema.nullable(),
  combatLog: z.array(skirmishLogEntrySchema),
});

export const createSkirmishPayloadSchema = z.object({
  characterId: uuidSchema,
  templateSlug: z.string().min(1).max(120),
});

export const resolveSkirmishAttackPayloadSchema = z.object({
  attackerCombatantId: uuidSchema,
  targetCombatantId: uuidSchema,
  advantage: skirmishAdvantageSchema.optional(),
  itemSlug: z.string().min(1).max(120).optional(),
  mode: skirmishWeaponModeSchema.optional(),
  sneakAttack: z.boolean().optional(),
  divineSmite: z.boolean().optional(),
  smiteSlotLevel: z.number().int().min(1).max(5).optional(),
  smiteVsUndeadOrFiend: z.boolean().optional(),
  huntersMark: z.boolean().optional(),
  colossusSlayer: z.boolean().optional(),
  divineStrike: z.boolean().optional(),
  graze: z.boolean().optional(),
  steadyAim: z.boolean().optional(),
  strokeOfLuck: z.boolean().optional(),
  spentInspiration: z.boolean().optional(),
  assassinate: z.boolean().optional(),
  brutalStrike: z.boolean().optional(),
  cunningStrikeEffects: z.array(z.string()).optional(),
});

export const skirmishAttackResultSchema = z.object({
  skirmish: skirmishDetailSchema,
  hit: z.boolean(),
  critical: z.boolean(),
  attackTotal: z.number(),
  attackExpression: z.string().min(1),
  attackRolls: z.array(z.number()),
  targetAc: z.number(),
  damageTotal: z.number().nullable(),
  damageExpression: z.string().nullable(),
  damageRolls: z.array(z.number()).default([]),
  note: z.string().nullable(),
  attackerCombatantId: uuidSchema,
  targetCombatantId: uuidSchema,
});

export const skirmishSummaryListSchema = z.array(skirmishSummarySchema);

export type SkirmishStatus = z.infer<typeof skirmishStatusSchema>;
export type SkirmishWinnerKind = z.infer<typeof skirmishWinnerKindSchema>;
export type SkirmishAdvantage = z.infer<typeof skirmishAdvantageSchema>;
export type SkirmishCombatant = z.infer<typeof skirmishCombatantSchema>;
export type SkirmishWeaponOption = z.infer<typeof skirmishWeaponOptionSchema>;
export type SkirmishLogEntry = z.infer<typeof skirmishLogEntrySchema>;
export type SkirmishSummary = z.infer<typeof skirmishSummarySchema>;
export type SkirmishDetail = z.infer<typeof skirmishDetailSchema>;
export type CreateSkirmishPayload = z.infer<typeof createSkirmishPayloadSchema>;
export type ResolveSkirmishAttackPayload = z.infer<
  typeof resolveSkirmishAttackPayloadSchema
>;
export type SkirmishAttackResult = z.infer<typeof skirmishAttackResultSchema>;
