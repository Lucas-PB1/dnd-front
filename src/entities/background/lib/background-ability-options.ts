import type { AbilityScores } from "@/entities/character/types";

export type BackgroundAbilityBoostOption = {
  value: string;
  label: string;
};

/** Monta opções +2/+1 apenas com os atributos permitidos pelo antecedente (PHB 2024). */
export function buildBackgroundAbilityBoostOptions(
  slugs: string[] | undefined,
  names: string[] | undefined,
): BackgroundAbilityBoostOption[] {
  return (slugs ?? [])
    .filter((slug): slug is string => !!slug?.trim())
    .map((slug, index) => ({
      value: slug,
      label: names?.[index]?.trim() || slug,
    }));
}

export function isBackgroundAbilityBoostAllowed(
  slug: string | undefined,
  allowedSlugs: string[],
): boolean {
  return !!slug?.trim() && allowedSlugs.includes(slug);
}
