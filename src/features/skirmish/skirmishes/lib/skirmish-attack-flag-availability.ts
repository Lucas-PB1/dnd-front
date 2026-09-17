import type { CharacterState } from "@/entities/character/session-types";
import type {
  CharacterDetail,
  CharacterSpell,
  ClassOption,
  SubclassOption,
  WeaponAttackSummary,
} from "@/entities/character/types";
import type {
  ClassEconomyActionRecord,
  ClassPanelActionRecord,
  CombatMechanicalCatalog,
  CunningStrikeEffect,
  SubclassTableActionCatalogEntry,
} from "@/entities/combat-mechanical/types";
import type { ClassEconomyAction } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";

export const SKIRMISH_ATTACK_FLAG_KEYS = [
  "sneakAttack",
  "divineSmite",
  "smiteVsUndeadOrFiend",
  "huntersMark",
  "colossusSlayer",
  "divineStrike",
  "graze",
  "steadyAim",
  "spentInspiration",
  "assassinate",
  "brutalStrike",
  "strokeOfLuck",
] as const;

export type SkirmishAttackFlagKey = (typeof SKIRMISH_ATTACK_FLAG_KEYS)[number];

const ALWAYS_PREPARED_LIST_TYPE = "always_prepared" as const;
const SMITE_VS_UNDEAD_FLAG: SkirmishAttackFlagKey = "smiteVsUndeadOrFiend";
const SPENT_INSPIRATION_FLAG: SkirmishAttackFlagKey = "spentInspiration";
const SNEAK_ATTACK_FLAG: SkirmishAttackFlagKey = "sneakAttack";
const DIVINE_SMITE_FLAG: SkirmishAttackFlagKey = "divineSmite";

export type RemainingSpellSlot = {
  level: number;
  remaining: number;
};

export type SkirmishAttackFlagAvailabilityInput = {
  weapon: WeaponAttackSummary | null;
  inspiration: boolean;
  featEffectFlags: CharacterDetail["featEffectFlags"];
  remainingSpellSlots: RemainingSpellSlot[];
  identifiers: readonly string[];
};

type EconomyIdentifierSource = Pick<
  ClassEconomyAction,
  "id" | "tableAction" | "spellSlug" | "resourceSlug" | "freeResourceSlug"
>;

export function remainingSpellSlotsFromMap(
  remaining: Record<string, number> | undefined,
): RemainingSpellSlot[] {
  return Object.entries(remaining ?? {})
    .map(([level, count]) => ({
      level: Number(level),
      remaining: Number(count),
    }))
    .filter((slot) => slot.level >= 1 && slot.remaining > 0)
    .sort((a, b) => a.level - b.level);
}

function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function pushIdentifier(bag: string[], value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed) bag.push(trimmed);
}

function collectEconomyIdentifiers(
  bag: string[],
  actions: readonly EconomyIdentifierSource[],
) {
  for (const action of actions) {
    pushIdentifier(bag, action.id);
    pushIdentifier(bag, action.tableAction);
    pushIdentifier(bag, action.spellSlug);
    pushIdentifier(bag, action.resourceSlug);
    pushIdentifier(bag, action.freeResourceSlug);
  }
}

function collectOptionIdentifiers(
  bag: string[],
  options: readonly { optionKey: string; valueId: string }[],
) {
  for (const option of options) {
    pushIdentifier(bag, option.valueId);
    pushIdentifier(bag, option.optionKey);
  }
}

export function identifiersFromSheetCatalog(input: {
  economyActions?: readonly EconomyIdentifierSource[];
  panelActions?: readonly Pick<ClassPanelActionRecord, "slug" | "resourceSlug">[];
  economyRecords?: readonly Pick<
    ClassEconomyActionRecord,
    "id" | "tableAction" | "spellSlug" | "resourceSlug" | "freeResourceSlug"
  >[];
  cunningStrikeEffects?: readonly Pick<CunningStrikeEffect, "slug">[];
  tableActions?: readonly Pick<SubclassTableActionCatalogEntry, "slug">[];
  characterSpells?: readonly CharacterSpell[];
  subclassOptions?: readonly SubclassOption[];
  classOptions?: readonly ClassOption[];
}): string[] {
  const bag: string[] = [];
  collectEconomyIdentifiers(bag, input.economyActions ?? []);
  collectEconomyIdentifiers(bag, input.economyRecords ?? []);
  for (const action of input.panelActions ?? []) {
    pushIdentifier(bag, action.slug);
    pushIdentifier(bag, action.resourceSlug);
  }
  for (const effect of input.cunningStrikeEffects ?? []) {
    pushIdentifier(bag, effect.slug);
  }
  for (const action of input.tableActions ?? []) {
    pushIdentifier(bag, action.slug);
  }
  for (const spell of input.characterSpells ?? []) {
    pushIdentifier(bag, spell.spellSlug);
  }
  collectOptionIdentifiers(bag, input.subclassOptions ?? []);
  collectOptionIdentifiers(bag, input.classOptions ?? []);
  if ((input.cunningStrikeEffects ?? []).length > 0) {
    pushIdentifier(bag, camelToKebab(SNEAK_ATTACK_FLAG));
  }
  return bag;
}

function identifierCoversFlag(identifier: string, kebabFlag: string): boolean {
  if (identifier === kebabFlag) return true;
  if (identifier.startsWith(`${kebabFlag}-`)) return true;
  if (identifier.endsWith(`-${kebabFlag}`)) return true;
  return identifier.includes(`-${kebabFlag}-`);
}

function catalogCoversFlag(
  identifiers: readonly string[],
  flag: SkirmishAttackFlagKey,
): boolean {
  const kebabFlag = camelToKebab(flag);
  return identifiers.some((identifier) =>
    identifierCoversFlag(identifier, kebabFlag),
  );
}

function weaponCoversFlag(
  weapon: WeaponAttackSummary | null,
  flag: SkirmishAttackFlagKey,
): boolean {
  if (!weapon) return false;
  return Object.entries(weapon).some(([key, value]) => {
    if (!key.startsWith(flag)) return false;
    return value != null && value !== false && value !== "";
  });
}

function isSmiteFlag(flag: SkirmishAttackFlagKey): boolean {
  return camelToKebab(flag).includes("smite");
}

function canShowCatalogOrWeaponFlag(
  flag: SkirmishAttackFlagKey,
  input: SkirmishAttackFlagAvailabilityInput,
): boolean {
  const fromWeapon = weaponCoversFlag(input.weapon, flag);
  const fromCatalog = catalogCoversFlag(input.identifiers, flag);
  if (flag === SNEAK_ATTACK_FLAG) return fromWeapon && fromCatalog;
  return fromWeapon || fromCatalog;
}

export function availableSkirmishAttackFlagKeys(
  input: SkirmishAttackFlagAvailabilityInput,
): SkirmishAttackFlagKey[] {
  const melee = input.weapon?.mode === "melee";
  const hasSlots = input.remainingSpellSlots.length > 0;
  const visible: SkirmishAttackFlagKey[] = [];

  for (const flag of SKIRMISH_ATTACK_FLAG_KEYS) {
    if (flag === SPENT_INSPIRATION_FLAG) {
      if (input.inspiration && input.featEffectFlags?.inspirationRefundOnFail) {
        visible.push(flag);
      }
      continue;
    }
    if (flag === SMITE_VS_UNDEAD_FLAG) continue;
    if (!canShowCatalogOrWeaponFlag(flag, input)) continue;
    if (isSmiteFlag(flag) && (!melee || !hasSlots)) continue;
    visible.push(flag);
  }

  if (visible.includes(DIVINE_SMITE_FLAG)) {
    visible.push(SMITE_VS_UNDEAD_FLAG);
  }

  return visible;
}

export function visibleSkirmishAttackFlagsFromSheet(input: {
  character: CharacterDetail;
  catalog: CombatMechanicalCatalog | undefined;
  economyActions: readonly ClassEconomyAction[];
  weapon: WeaponAttackSummary | null;
  state: CharacterState | undefined;
}): SkirmishAttackFlagKey[] {
  const grantedSpells = (input.state?.grantedSpellCastOptions ?? []).map(
    (row) => ({
      spellSlug: row.spellSlug,
      listType: ALWAYS_PREPARED_LIST_TYPE,
    }),
  );
  const panelActions = resolvePanelActions(input.catalog?.panelActions ?? [], {
    classSlug: input.character.classSlug,
    level: input.character.level,
    subclassSlug: input.character.subclassSlug,
  });
  const identifiers = identifiersFromSheetCatalog({
    economyActions: input.economyActions,
    panelActions,
    cunningStrikeEffects: input.catalog?.cunningStrikeEffects,
    tableActions: input.catalog?.tableActions,
    characterSpells: [
      ...(input.character.characterSpells ?? []),
      ...grantedSpells,
    ],
    subclassOptions: input.character.subclassOptions ?? [],
    classOptions: input.character.classOptions ?? [],
  });
  if (input.character.classSlug === "paladin") {
    pushIdentifier(identifiers, camelToKebab(DIVINE_SMITE_FLAG));
  }
  return availableSkirmishAttackFlagKeys({
    inspiration: input.state?.inspiration ?? false,
    featEffectFlags: input.character.featEffectFlags,
    remainingSpellSlots: remainingSpellSlotsFromMap(
      input.state?.spellSlotsRemaining,
    ),
    identifiers,
    weapon: input.weapon,
  });
}
