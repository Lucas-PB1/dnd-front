import { z } from "zod";

import type { CombatMechanicalCatalog } from "@/entities/combat-mechanical/types";
import { parseApiDto } from "@/shared/lib/parse-api-dto";

const gunslingerManeuverSchema = z.looseObject({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  effectKind: z.string(),
  riskCost: z.number(),
  fromLevel: z.number(),
  subclassSlug: z.string().optional(),
});

const battleMasterManeuverSchema = z.looseObject({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  timing: z.string(),
  addsToDamage: z.boolean(),
  addsToAttack: z.boolean(),
});

const cunningStrikeEffectSchema = z.looseObject({
  slug: z.string(),
  name: z.string(),
  cost: z.number(),
  unlockLevel: z.number(),
  note: z.string(),
  saveAbility: z.string().optional(),
  subclassSlug: z.string().optional(),
});

const strikeOptionSchema = z.looseObject({
  slug: z.string(),
  name: z.string(),
  extraDice: z.string(),
  extraDiceL18: z.string(),
  replacesAttackWithSave: z.boolean(),
  ignoreTargetArmor: z.boolean(),
  ignoreDamageResistance: z.boolean(),
  addsArenaEffect: z.boolean(),
  noteOnly: z.boolean(),
  subclassSlug: z.string().optional(),
  resourceSlug: z.string().nullable().optional(),
  tableAction: z.string().nullable().optional(),
  costDice: z.string().nullable().optional(),
  damageType: z.string().nullable().optional(),
  saveAbility: z.string().nullable().optional(),
  onFailCondition: z.string().nullable().optional(),
  onFailPendingKind: z.string().nullable().optional(),
  onHitPendingKind: z.string().nullable().optional(),
  secondaryDice: z.string().nullable().optional(),
  secondaryDiceL18: z.string().nullable().optional(),
  arenaEffectSlug: z.string().nullable().optional(),
});

const tableActionSchema = z.looseObject({
  subclassSlug: z.string(),
  slug: z.string(),
  name: z.string(),
  unlockLevel: z.number(),
  alwaysSpendsPool: z.boolean(),
  rollsPoolDie: z.boolean(),
  spendsOnlyOnSuccess: z.boolean(),
  freeResourceSlug: z.string().optional(),
  alwaysPoolCost: z.number().optional(),
  repeatPoolCost: z.number().optional(),
});

const economyActionSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  economy: z.string(),
  minLevel: z.number(),
  classSlug: z.string().nullable().optional(),
  subclassSlug: z.string().optional(),
  speciesSlug: z.string().nullable().optional(),
  featSlug: z.string().nullable().optional(),
  itemSlug: z.string().nullable().optional(),
  heritageTraitSlug: z.string().nullable().optional(),
  threadSlug: z.string().nullable().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
});

const panelActionSchema = z.looseObject({
  panelKey: z.string(),
  classSlug: z.string(),
  slug: z.string(),
  name: z.string(),
  minLevel: z.number(),
  section: z.string(),
  spendsFocus: z.boolean(),
  sortOrder: z.number(),
});

export const combatMechanicalCatalogSchema = z.looseObject({
  gunslingerManeuvers: z.array(gunslingerManeuverSchema),
  battleMasterManeuvers: z.array(battleMasterManeuverSchema),
  cunningStrikeEffects: z.array(cunningStrikeEffectSchema),
  strikeOptions: z.array(strikeOptionSchema),
  tableActions: z.array(tableActionSchema),
  personaMasks: z.array(
    z.looseObject({
      slug: z.string(),
      name: z.string(),
    }),
  ),
  beastborneAspectBenefits: z.array(
    z.looseObject({
      level: z.number(),
      note: z.string(),
    }),
  ),
  dungeoneerSlayerLabels: z.array(z.string()),
  precautionSpells: z.array(
    z.looseObject({
      slug: z.string(),
      name: z.string(),
    }),
  ),
  economyActions: z.array(economyActionSchema),
  panelActions: z.array(panelActionSchema),
});

export function parseCombatMechanicalCatalog(
  data: unknown,
): CombatMechanicalCatalog {
  return parseApiDto(
    combatMechanicalCatalogSchema,
    data,
    "catálogo mecânico de combate",
  );
}
