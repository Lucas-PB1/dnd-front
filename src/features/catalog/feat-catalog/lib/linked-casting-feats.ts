import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";

/** Espelha linked-casting-feat-options.ts na API. */
export const FEATS_CASTING_ABILITY_MATCHES_ASI = ["telekinetic", "telepathic"] as const;

export function isFeatCastingLinkedToAsi(featSlug: string): boolean {
  return (FEATS_CASTING_ABILITY_MATCHES_ASI as readonly string[]).includes(
    featSlug,
  );
}

export function syncLinkedCastingAbilityOption(
  featSlug: string,
  optionKey: string,
  valueId: string,
  current: FeatOption[],
  feat: CharacterFeat,
): FeatOption[] | null {
  if (!isFeatCastingLinkedToAsi(featSlug) || optionKey !== "abilityIncrease") {
    return null;
  }
  if (!valueId) return null;

  const filtered = current.filter(
    (option) =>
      !(
        option.featSlug === feat.featSlug &&
        option.instanceIndex === feat.instanceIndex &&
        option.optionKey === "castingAbility"
      ),
  );
  filtered.push({
    featSlug: feat.featSlug,
    instanceIndex: feat.instanceIndex,
    optionKey: "castingAbility",
    valueId,
  });
  return filtered;
}

export function linkedCastingAsiHint(featSlug: string): string | null {
  if (featSlug === "telekinetic") {
    return "Este atributo também define a conjuração de Mãos Mágicas.";
  }
  if (featSlug === "telepathic") {
    return "Este atributo também define a conjuração de Detectar Pensamentos.";
  }
  return null;
}

/** Oculta castingAbility duplicado quando o +1 já define conjuração. */
export function visibleFeatOptionDefs<T extends { optionKey: string }>(
  featSlug: string,
  defs: T[],
): T[] {
  if (!isFeatCastingLinkedToAsi(featSlug)) return defs;
  return defs.filter((def) => def.optionKey !== "castingAbility");
}
