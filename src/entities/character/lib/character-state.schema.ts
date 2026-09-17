import { z } from "zod";

import type { CharacterState } from "@/entities/character/session-types";
import { parseApiDto } from "@/shared/lib/parse-api-dto";

const spellSlotsMapSchema = z.record(z.string(), z.number());

const classResourceStateSchema = z.looseObject({
  slug: z.string(),
  name: z.string(),
  max: z.number(),
  used: z.number(),
  remaining: z.number(),
  dieFaces: z.number().nullable().optional(),
  dieLabel: z.string().nullable().optional(),
});

const grantedSpellCastOptionSchema = z.looseObject({
  spellSlug: z.string(),
  castEconomy: z.enum(["at_will", "once_per_long_rest", "slot_only"]),
  freeCastsRemaining: z.number().nullable(),
});

const companionTrackerSchema = z.looseObject({
  actorId: z.string(),
  name: z.string(),
  templateSlug: z.string().nullable(),
  hitPointsCurrent: z.number().nullable(),
  hitPointsMax: z.number().nullable(),
  armorClass: z.number().nullable(),
  defeated: z.boolean(),
  conditions: z.array(z.string()),
});

export const characterStateSchema = z.looseObject({
  spellSlotsMax: spellSlotsMapSchema,
  spellSlotsUsed: spellSlotsMapSchema,
  spellSlotsRemaining: spellSlotsMapSchema,
  classResources: z.array(classResourceStateSchema),
  concentratingOn: z.string().nullable(),
  conditions: z.array(z.string()),
  tempHp: z.number(),
  hitPointsCurrent: z.number().nullable(),
  hitPointsMax: z.number().nullable(),
  hitDiceCurrent: z.number(),
  hitDiceMax: z.number(),
  hitDie: z.string().nullable(),
  deathSaveSuccesses: z.number(),
  deathSaveFailures: z.number(),
  inspiration: z.boolean(),
  grantedSpellUses: z.record(z.string(), z.number()).optional(),
  grantedSpellCastOptions: z.array(grantedSpellCastOptionSchema).optional(),
  firearmChambers: z.record(z.string(), z.number()).optional(),
  rageActive: z.boolean().optional(),
  recklessActive: z.boolean().optional(),
  sacredWeaponActive: z.boolean().optional(),
  personaMasks: z.array(z.string()).optional(),
  bestialAspectLevel: z.number().optional(),
  missileShieldArmed: z.boolean().optional(),
  gigaMissileArmed: z.boolean().optional(),
  starryFormActive: z.boolean().optional(),
  stellarConstellation: z.string().nullable().optional(),
  boardedActorId: z.string().nullable().optional(),
  mesaCircumstances: z.array(z.string()).optional(),
  aberrantMutationActive: z.string().nullable().optional(),
  highElfCantripSwapAvailable: z.boolean().optional(),
  wildShapeActive: z.boolean(),
  wildShapeTemplateSlug: z.string().nullable(),
  wildShapeKnownSlugs: z.array(z.string()),
  wildShapeFormSwapAvailable: z.boolean(),
  wildShapeActorId: z.string().nullable(),
  companions: z.array(companionTrackerSchema),
});

const characterStateEnvelopeSchema = z.looseObject({
  state: characterStateSchema,
});

const transferInspirationResultSchema = z.looseObject({
  sourceState: characterStateSchema,
  targetState: characterStateSchema,
  note: z.string(),
});

export function parseCharacterState(data: unknown): CharacterState {
  return parseApiDto(characterStateSchema, data, "estado do personagem");
}

export function parseCharacterStateEnvelope<T extends { state: CharacterState }>(
  data: unknown,
): T {
  return parseApiDto(
    characterStateEnvelopeSchema,
    data,
    "estado do personagem",
  ) as T;
}

export function parseTransferInspirationResult(data: unknown) {
  return parseApiDto(
    transferInspirationResultSchema,
    data,
    "transferência de inspiração",
  );
}
