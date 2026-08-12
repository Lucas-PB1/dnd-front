/**
 * Espelha dnd-api `class-language-grant.ts`.
 * Druida L1: Druídico. Ladino L1: Gíria + 1. Patrulheiro L2: +2.
 */

export const THIEVES_CANT_LANGUAGE_SLUG = "thieves-cant";
export const DRUIDIC_LANGUAGE_SLUG = "druidic";

export type ClassLanguageGrant = {
  grantedSlugs: string[];
  choiceCount: number;
};

const EMPTY: ClassLanguageGrant = { grantedSlugs: [], choiceCount: 0 };

export function classLanguageGrant(
  classSlug: string | null | undefined,
  level: number,
): ClassLanguageGrant {
  if (classSlug === "rogue" && level >= 1) {
    return { grantedSlugs: [THIEVES_CANT_LANGUAGE_SLUG], choiceCount: 1 };
  }
  if (classSlug === "druid" && level >= 1) {
    return { grantedSlugs: [DRUIDIC_LANGUAGE_SLUG], choiceCount: 0 };
  }
  if (classSlug === "ranger" && level >= 2) {
    return { grantedSlugs: [], choiceCount: 2 };
  }
  return EMPTY;
}
