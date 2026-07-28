import {
  isBackgroundAbilityBoostAllowed,
  type BackgroundAbilityBoostOption,
} from "@/entities/background/lib/background-ability-options";
import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  previewBackgroundAbilityBoosts,
  type BackgroundBoostMode,
} from "@/entities/character/lib/background-boost";
import type { AbilityScores } from "@/entities/character/types";

export type BackgroundAbilityBoostValue = {
  mode: BackgroundBoostMode;
  plus2Slug: string;
  plus1Slug: string;
  plus1Slugs: string[];
};

export function createBackgroundAbilityBoostValue(
  partial?: Partial<BackgroundAbilityBoostValue>,
): BackgroundAbilityBoostValue {
  return {
    mode: partial?.mode ?? BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
    plus2Slug: partial?.plus2Slug ?? "",
    plus1Slug: partial?.plus1Slug ?? "",
    plus1Slugs:
      partial?.plus1Slugs?.length === 3
        ? partial.plus1Slugs
        : ["", "", ""],
  };
}

export function isBackgroundBoostPlus1x3Complete(plus1Slugs: string[]): boolean {
  const slugs = plus1Slugs.filter((slug) => !!slug?.trim());
  return slugs.length === 3 && new Set(slugs).size === 3;
}

export function applyBackgroundBoostModeChange(
  current: BackgroundAbilityBoostValue,
  nextMode: BackgroundBoostMode,
  allowedSlugs: string[],
): BackgroundAbilityBoostValue {
  if (nextMode === BACKGROUND_BOOST_MODE_PLUS1X3) {
    return {
      mode: nextMode,
      plus2Slug: "",
      plus1Slug: "",
      plus1Slugs:
        allowedSlugs.length === 3 ? [...allowedSlugs] : ["", "", ""],
    };
  }
  return {
    ...current,
    mode: nextMode,
    plus1Slugs: ["", "", ""],
  };
}

export function setBackgroundBoostPlus1x3Slug(
  plus1Slugs: string[],
  index: number,
  value: string,
): string[] {
  const current = [...plus1Slugs];
  while (current.length < 3) current.push("");
  current[index] = value;
  return current;
}

export function sanitizeBackgroundBoostSlugs(
  value: BackgroundAbilityBoostValue,
  allowedSlugs: string[],
): BackgroundAbilityBoostValue {
  const allowed = new Set(allowedSlugs);
  const plus2Slug =
    value.plus2Slug && allowed.has(value.plus2Slug) ? value.plus2Slug : "";
  const plus1Slug =
    value.plus1Slug && allowed.has(value.plus1Slug) ? value.plus1Slug : "";
  const plus1Slugs = value.plus1Slugs.map((slug) =>
    slug && allowed.has(slug) ? slug : "",
  );

  if (
    plus2Slug === value.plus2Slug &&
    plus1Slug === value.plus1Slug &&
    plus1Slugs.every((slug, index) => slug === value.plus1Slugs[index])
  ) {
    return value;
  }

  return { ...value, plus2Slug, plus1Slug, plus1Slugs };
}

export function computeBackgroundBoostPreview(
  base: AbilityScores,
  value: BackgroundAbilityBoostValue,
  allowedSlugs: string[],
): AbilityScores | null {
  if (value.mode === BACKGROUND_BOOST_MODE_PLUS1X3) {
    if (!isBackgroundBoostPlus1x3Complete(value.plus1Slugs)) return null;
    return previewBackgroundAbilityBoosts(base, {
      mode: BACKGROUND_BOOST_MODE_PLUS1X3,
      plus1Slugs: value.plus1Slugs as (keyof AbilityScores)[],
    });
  }

  const plus2 = isBackgroundAbilityBoostAllowed(value.plus2Slug, allowedSlugs)
    ? value.plus2Slug
    : "";
  const plus1 = isBackgroundAbilityBoostAllowed(value.plus1Slug, allowedSlugs)
    ? value.plus1Slug
    : "";

  if (!plus2 || !plus1 || plus2 === plus1) return null;

  return previewBackgroundAbilityBoosts(base, {
    mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
    plus2Slug: plus2 as keyof AbilityScores,
    plus1Slug: plus1 as keyof AbilityScores,
  });
}

export function validateBackgroundAbilityBoost(
  value: BackgroundAbilityBoostValue,
): string | null {
  if (value.mode === BACKGROUND_BOOST_MODE_PLUS1X3) {
    const slugs = value.plus1Slugs
      .map((slug) => slug?.trim())
      .filter((slug): slug is string => !!slug);
    if (slugs.length !== 3 || new Set(slugs).size !== 3) {
      return "Escolha três atributos diferentes para +1.";
    }
    return null;
  }

  const plus2 = value.plus2Slug?.trim();
  const plus1 = value.plus1Slug?.trim();
  if (!plus2 || !plus1) {
    return "Escolha os bônus +2 e +1 do antecedente.";
  }
  if (plus2 === plus1) {
    return "+2 e +1 devem ser atributos diferentes.";
  }
  return null;
}

export function formatBoostOptionLabels(
  options: BackgroundAbilityBoostOption[],
): string {
  return options.map((option) => option.label).join(", ");
}
