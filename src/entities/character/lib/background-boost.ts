import type { AbilityScores } from "@/entities/character/types";

const ABILITY_SCORE_CAP = 20;

/** Espelha applyBackgroundAbilityBoosts da API — só para preview no wizard. */
export function previewBackgroundAbilityBoosts(
  base: AbilityScores,
  plus2Slug: keyof AbilityScores,
  plus1Slug: keyof AbilityScores,
): AbilityScores {
  if (plus2Slug === plus1Slug) return base;
  return {
    ...base,
    [plus2Slug]: Math.min(ABILITY_SCORE_CAP, base[plus2Slug] + 2),
    [plus1Slug]: Math.min(ABILITY_SCORE_CAP, base[plus1Slug] + 1),
  };
}

/** Remove bônus +2/+1 dos valores finais persistidos pela API. */
export function stripBackgroundAbilityBoosts(
  final: AbilityScores,
  plus2Slug: string | null | undefined,
  plus1Slug: string | null | undefined,
): AbilityScores {
  if (!plus2Slug?.trim() || !plus1Slug?.trim() || plus2Slug === plus1Slug) {
    return { ...final };
  }
  const plus2Key = plus2Slug as keyof AbilityScores;
  const plus1Key = plus1Slug as keyof AbilityScores;
  return {
    ...final,
    [plus2Key]: final[plus2Key] - 2,
    [plus1Key]: final[plus1Key] - 1,
  };
}
