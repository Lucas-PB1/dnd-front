import type { AbilityScores } from "@/entities/character/types";
import type { FeatOption } from "@/entities/character/sheet-types";
import {
  STANDARD_ABILITY_SCORE_CAP,
  abilityScoreCapForFeat,
} from "@/entities/character/lib/epic-boon-feat-options";

const ASI_FEAT_SLUG = "ability-score-improvement";

const ABILITY_KEYS: (keyof AbilityScores)[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

function bump(
  scores: AbilityScores,
  slug: string,
  delta: number,
  cap: number,
): AbilityScores {
  if (!ABILITY_KEYS.includes(slug as keyof AbilityScores)) return scores;
  const key = slug as keyof AbilityScores;
  return {
    ...scores,
    [key]: Math.min(cap, scores[key] + delta),
  };
}

function asiInstanceKeys(featOptions: FeatOption[]): string[] {
  const keys = new Set<string>();
  for (const option of featOptions) {
    if (option.featSlug !== ASI_FEAT_SLUG) continue;
    keys.add(`${option.featSlug}:${option.instanceIndex ?? 0}`);
  }
  return [...keys];
}

/** Espelha applyFeatAbilityIncreases da API — preview no wizard. */
export function previewFeatAbilityBoosts(
  scores: AbilityScores,
  featOptions: FeatOption[],
  epicBoonFeatSlugs?: ReadonlySet<string>,
): AbilityScores {
  let result = { ...scores };

  for (const key of asiInstanceKeys(featOptions)) {
    const [featSlug, indexStr] = key.split(":");
    const instanceIndex = Number.parseInt(indexStr, 10);
    const instanceOptions = featOptions.filter(
      (o) =>
        o.featSlug === featSlug &&
        (o.instanceIndex ?? 0) === instanceIndex,
    );
    const mode = instanceOptions.find(
      (o) => o.optionKey === "distributionMode",
    )?.valueId;
    const primary = instanceOptions.find(
      (o) => o.optionKey === "primaryAbility",
    )?.valueId;
    if (mode === "plus2" && primary?.trim()) {
      result = bump(result, primary.trim(), 2, STANDARD_ABILITY_SCORE_CAP);
    } else if (mode === "plus1plus1" && primary?.trim()) {
      const secondary = instanceOptions.find(
        (o) => o.optionKey === "secondaryAbility",
      )?.valueId;
      if (secondary?.trim()) {
        result = bump(result, primary.trim(), 1, STANDARD_ABILITY_SCORE_CAP);
        result = bump(result, secondary.trim(), 1, STANDARD_ABILITY_SCORE_CAP);
      }
    }
  }

  for (const option of featOptions) {
    if (option.optionKey !== "abilityIncrease" || !option.valueId?.trim()) {
      continue;
    }
    const cap = abilityScoreCapForFeat(option.featSlug, epicBoonFeatSlugs);
    result = bump(result, option.valueId.trim(), 1, cap);
  }
  return result;
}
