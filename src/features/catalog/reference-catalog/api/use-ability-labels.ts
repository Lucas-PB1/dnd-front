"use client";

import { useCallback, useMemo } from "react";

import {
  abilityLabelMap,
  abilityShortMap,
  resolveAbilityLabel,
  sortedAbilitySlugs,
} from "@/entities/ability/lib/label-map";
import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_KEYS } from "@/features/character/create-character/lib/abilities/point-buy";
import { useAbilities } from "@/features/catalog/reference-catalog/api/use-reference";

/** Labels e ordem de atributos a partir de `GET /abilities`. */
export function useAbilityLabels() {
  const query = useAbilities();
  const abilities = query.data?.data ?? [];

  const labels = useMemo(() => abilityLabelMap(abilities), [abilities]);
  const shorts = useMemo(() => abilityShortMap(abilities), [abilities]);

  const orderedKeys = useMemo(() => {
    const fromCatalog = sortedAbilitySlugs(abilities).filter(
      (slug): slug is keyof AbilityScores =>
        ABILITY_KEYS.includes(slug as keyof AbilityScores),
    );
    return fromCatalog.length === ABILITY_KEYS.length
      ? fromCatalog
      : ABILITY_KEYS;
  }, [abilities]);

  const labelOf = useCallback(
    (slug: string) => resolveAbilityLabel(labels, slug),
    [labels],
  );

  const shortOf = useCallback(
    (slug: string) => shorts[slug] ?? slug.slice(0, 3).toUpperCase(),
    [shorts],
  );

  return {
    labels,
    shorts,
    orderedKeys,
    labelOf,
    shortOf,
    isPending: query.isPending,
    isError: query.isError,
  };
}
