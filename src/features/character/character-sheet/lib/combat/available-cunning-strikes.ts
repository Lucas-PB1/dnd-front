import type { CunningStrikeEffect } from "@/entities/combat-mechanical/types";

export type CunningStrikeOption = {
  slug: string;
  label: string;
  cost: number;
  level: number;
};

/**
 * Filtra efeitos do catálogo da API por nível / subclasse.
 * Espelha `availableCunningStrikeEffects` da dnd-api (sem lista local).
 */
export function availableCunningStrikes(
  catalog: readonly CunningStrikeEffect[],
  input: {
    level: number;
    subclassSlug?: string | null;
  },
): CunningStrikeOption[] {
  return catalog
    .filter(
      (effect) =>
        input.level >= effect.unlockLevel &&
        (!effect.subclassSlug || effect.subclassSlug === input.subclassSlug),
    )
    .map((effect) => ({
      slug: effect.slug,
      label: effect.name,
      cost: effect.cost,
      level: effect.unlockLevel,
    }));
}
