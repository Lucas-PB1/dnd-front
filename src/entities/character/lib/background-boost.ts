import type { AbilityScores } from "@/entities/character/types";

const ABILITY_SCORE_CAP = 20;

export const BACKGROUND_BOOST_MODE_PLUS2_PLUS1 = "plus2plus1" as const;
export const BACKGROUND_BOOST_MODE_PLUS1X3 = "plus1x3" as const;

export type BackgroundBoostMode =
  | typeof BACKGROUND_BOOST_MODE_PLUS2_PLUS1
  | typeof BACKGROUND_BOOST_MODE_PLUS1X3;

export type BackgroundAbilityBoostPreviewInput =
  | {
      mode: typeof BACKGROUND_BOOST_MODE_PLUS2_PLUS1;
      plus2Slug: keyof AbilityScores;
      plus1Slug: keyof AbilityScores;
    }
  | {
      mode: typeof BACKGROUND_BOOST_MODE_PLUS1X3;
      plus1Slugs: (keyof AbilityScores)[];
    };

function bump(
  scores: AbilityScores,
  key: keyof AbilityScores,
  amount: number,
): AbilityScores {
  return {
    ...scores,
    [key]: Math.min(ABILITY_SCORE_CAP, scores[key] + amount),
  };
}

/** Espelha applyBackgroundAbilityBoosts da API — só para preview no wizard. */
export function previewBackgroundAbilityBoosts(
  base: AbilityScores,
  input: BackgroundAbilityBoostPreviewInput,
): AbilityScores {
  if (input.mode === BACKGROUND_BOOST_MODE_PLUS1X3) {
    if (input.plus1Slugs.length !== 3) return base;
    if (new Set(input.plus1Slugs).size !== 3) return base;
    return input.plus1Slugs.reduce(
      (scores, key) => bump(scores, key, 1),
      { ...base },
    );
  }

  if (input.plus2Slug === input.plus1Slug) return base;
  return bump(bump(base, input.plus2Slug, 2), input.plus1Slug, 1);
}

/** Remove bônus do antecedente dos valores finais persistidos pela API. */
export function stripBackgroundAbilityBoosts(
  final: AbilityScores,
  input: {
    mode?: string | null;
    plus2Slug?: string | null;
    plus1Slug?: string | null;
    plus1Slugs?: string[] | null;
  },
): AbilityScores {
  const mode =
    input.mode === BACKGROUND_BOOST_MODE_PLUS1X3
      ? BACKGROUND_BOOST_MODE_PLUS1X3
      : BACKGROUND_BOOST_MODE_PLUS2_PLUS1;

  if (mode === BACKGROUND_BOOST_MODE_PLUS1X3) {
    const slugs = (input.plus1Slugs ?? []).filter((slug) => !!slug?.trim());
    if (slugs.length !== 3) return { ...final };
    let next = { ...final };
    for (const slug of slugs) {
      const key = slug as keyof AbilityScores;
      next = { ...next, [key]: next[key] - 1 };
    }
    return next;
  }

  if (
    !input.plus2Slug?.trim() ||
    !input.plus1Slug?.trim() ||
    input.plus2Slug === input.plus1Slug
  ) {
    return { ...final };
  }

  const plus2Key = input.plus2Slug as keyof AbilityScores;
  const plus1Key = input.plus1Slug as keyof AbilityScores;
  return {
    ...final,
    [plus2Key]: final[plus2Key] - 2,
    [plus1Key]: final[plus1Key] - 1,
  };
}
