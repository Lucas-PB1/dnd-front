/**
 * Espelha dnd-api `game/sheet/domain/stats/resolve-initiative-roll.ts`.
 */

import type { AdvantageMode } from "@/features/character/character-sheet/api/character-rolls.api";

export const FOCUSED_INITIATIVE_TRAIT_SLUG = "focused-initiative";
export const GIANTKIN_STONE_ANCESTRY_KIND = "giantkinAncestryId";
export const GIANTKIN_STONE_ANCESTRY_SLUG = "stone";

type CharacterFeatLike = { featSlug: string };
type HeritageTraitPick = { choiceKind: string; choiceSlug: string };
type SpeciesChoiceLike = { choiceKind: string; choiceSlug: string };

export type InitiativeRollContext = {
  dexterityModifier: number;
  wisdomModifier: number;
  intelligenceModifier: number;
  proficiencyBonus: number;
  classSlug: string;
  subclassSlug: string | null;
  level: number;
  characterFeats: readonly CharacterFeatLike[];
  heritageChoices?: readonly HeritageTraitPick[];
  speciesChoices?: readonly SpeciesChoiceLike[];
};

export type InitiativeRollOptions = {
  advantage?: AdvantageMode;
  stonePulse?: boolean;
};

export type InitiativeBonusBreakdown = {
  total: number;
  notes: string[];
};

function aggregateTraitTakes(
  picks: readonly HeritageTraitPick[],
): { traitSlug: string; takeCount: number }[] {
  const bySlug = new Map<string, number>();
  for (const pick of picks) {
    if (!pick.choiceKind.startsWith("heritage_trait_")) continue;
    bySlug.set(pick.choiceSlug, (bySlug.get(pick.choiceSlug) ?? 0) + 1);
  }
  return [...bySlug.entries()].map(([traitSlug, takeCount]) => ({
    traitSlug,
    takeCount,
  }));
}

function collectHeritageTraitPicks(
  choices: readonly HeritageTraitPick[],
): HeritageTraitPick[] {
  return choices.filter((choice) =>
    choice.choiceKind.startsWith("heritage_trait_"),
  );
}

export function hasAlertFeat(
  characterFeats: readonly CharacterFeatLike[] | undefined,
): boolean {
  return (characterFeats ?? []).some((feat) => feat.featSlug === "alert");
}

export function focusedInitiativeTakeCount(
  heritageChoices: readonly HeritageTraitPick[] | undefined,
): number {
  return (
    aggregateTraitTakes(collectHeritageTraitPicks(heritageChoices ?? [])).find(
      (row) => row.traitSlug === FOCUSED_INITIATIVE_TRAIT_SLUG,
    )?.takeCount ?? 0
  );
}

export function hasInitiativeProficiency(ctx: {
  characterFeats: readonly CharacterFeatLike[];
  heritageChoices?: readonly HeritageTraitPick[];
}): boolean {
  return (
    hasAlertFeat(ctx.characterFeats) ||
    focusedInitiativeTakeCount(ctx.heritageChoices) >= 1
  );
}

export function hasGiantkinStoneAncestry(
  speciesChoices: readonly SpeciesChoiceLike[] | undefined,
): boolean {
  return (speciesChoices ?? []).some(
    (choice) =>
      choice.choiceKind === GIANTKIN_STONE_ANCESTRY_KIND &&
      choice.choiceSlug === GIANTKIN_STONE_ANCESTRY_SLUG,
  );
}

function isRangerClass(classSlug: string): boolean {
  return classSlug === "ranger";
}

export function resolveInitiativeBonus(
  ctx: InitiativeRollContext,
): InitiativeBonusBreakdown {
  let total = ctx.dexterityModifier;
  const notes: string[] = [];

  if (hasInitiativeProficiency(ctx)) {
    total += ctx.proficiencyBonus;
    if (hasAlertFeat(ctx.characterFeats)) {
      notes.push("Alerta: +PB");
    }
    if (focusedInitiativeTakeCount(ctx.heritageChoices) >= 1) {
      notes.push("Iniciativa Concentrada: +PB");
    }
  }

  if (
    isRangerClass(ctx.classSlug) &&
    ctx.subclassSlug === "gloom-stalker" &&
    ctx.level >= 3
  ) {
    total += ctx.wisdomModifier;
    notes.push(`Emboscador: +${ctx.wisdomModifier} SAB`);
  }

  if (ctx.subclassSlug === "trapper-guild" && ctx.level >= 7) {
    total += ctx.intelligenceModifier;
    notes.push(`Emboscador (guilda): +${ctx.intelligenceModifier} INT`);
  }

  return { total, notes };
}

export function hasAutomaticInitiativeAdvantage(
  ctx: Pick<
    InitiativeRollContext,
    "classSlug" | "subclassSlug" | "level"
  >,
): boolean {
  if (ctx.classSlug === "barbarian" && ctx.level >= 7) return true;
  if (ctx.subclassSlug === "champion" && ctx.level >= 3) return true;
  if (ctx.subclassSlug === "assassin" && ctx.level >= 3) return true;
  if (ctx.subclassSlug === "nightwatcher" && ctx.level >= 3) return true;
  if (ctx.subclassSlug === "highway-rider" && ctx.level >= 3) return true;
  return false;
}

export function initiativeBonus(
  dexterityModifier: number,
  proficiencyBonus: number,
  characterFeats: readonly CharacterFeatLike[] | undefined,
  extra?: Omit<
    InitiativeRollContext,
    "dexterityModifier" | "proficiencyBonus" | "characterFeats"
  >,
): number {
  return resolveInitiativeBonus({
    dexterityModifier,
    proficiencyBonus,
    characterFeats: characterFeats ?? [],
    wisdomModifier: extra?.wisdomModifier ?? 0,
    intelligenceModifier: extra?.intelligenceModifier ?? 0,
    classSlug: extra?.classSlug ?? "",
    subclassSlug: extra?.subclassSlug ?? null,
    level: extra?.level ?? 0,
    heritageChoices: extra?.heritageChoices,
    speciesChoices: extra?.speciesChoices,
  }).total;
}
