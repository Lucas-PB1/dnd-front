import { z } from "zod";

import type {
  CharacterInventory,
  InventoryItem,
} from "@/entities/character/session-types";
import { parseApiDto } from "@/shared/lib/parse-api-dto";

const coinPurseSchema = z.looseObject({
  copper: z.number(),
  silver: z.number(),
  electrum: z.number(),
  gold: z.number(),
  platinum: z.number(),
});

export const inventoryItemSchema = z.looseObject({
  itemSlug: z.string(),
  itemName: z.string(),
  itemType: z.string(),
  quantity: z.number(),
  location: z.enum(["equipped", "backpack"]),
  equipmentSlot: z.string().nullable(),
  attuned: z.boolean(),
  isPactWeapon: z.boolean().optional(),
  requiresAttunement: z.boolean(),
  cursed: z.boolean().optional(),
  curseBroken: z.boolean().optional(),
  effectsActive: z.boolean(),
  consumable: z.boolean().optional(),
  effectsStatus: z.enum([
    "active",
    "inactive_unequipped",
    "inactive_unattuned",
  ]),
  weightKg: z.number(),
  attachedCharmSlug: z.string().nullable().optional(),
  attachedCharmName: z.string().nullable().optional(),
  attachedCoverageSlug: z.string().nullable().optional(),
  attachedCoverageName: z.string().nullable().optional(),
  attachedCoverageBonus: z.number().nullable().optional(),
  attachedCoverageAttuned: z.boolean().optional(),
  attachedCoverageRequiresAttunement: z.boolean().optional(),
  attachedCoverageSpellSlug: z.string().nullable().optional(),
  boundSpellSlug: z.string().nullable().optional(),
  isCoverage: z.boolean().optional(),
  isMagic: z.boolean().optional(),
  propertiesKind: z.string().nullable().optional(),
  spellSaveDc: z.number().nullable().optional(),
  spellAttackBonus: z.number().nullable().optional(),
  requiresComponents: z.boolean().optional(),
  useCasterAbility: z.boolean().optional(),
  instanceProperties: z.record(z.string(), z.unknown()).nullable().optional(),
  costText: z.string().nullable().optional(),
  containedInItemSlug: z.string().nullable().optional(),
});

export const characterInventorySchema = z.looseObject({
  items: z.array(inventoryItemSchema),
  encumbrance: z.looseObject({
    totalWeightKg: z.number(),
    carryingCapacityKg: z.number(),
    encumbered: z.boolean(),
  }),
  wealth: coinPurseSchema,
  paymentContext: z.looseObject({
    inCampaign: z.boolean(),
    viewerIsDmOrAssistant: z.boolean(),
    allowPlayerSkipPayment: z.boolean(),
    chargeApplies: z.boolean(),
  }),
  attunementLimit: z.number().int().positive(),
});

export function parseInventoryItem(data: unknown): InventoryItem {
  return parseApiDto(inventoryItemSchema, data, "item do inventário");
}

export function parseCharacterInventory(data: unknown): CharacterInventory {
  return parseApiDto(
    characterInventorySchema,
    data,
    "inventário do personagem",
  );
}
