"use client";

import { useQuery } from "@tanstack/react-query";

import type { ClassSpellOption } from "@/entities/class/types";
import {
  fetchAllSpellsSummary,
  fetchSangromancySpells,
  fetchSpellBySlug,
  fetchSpellLabels,
  fetchSpells,
  spellKeys,
} from "@/features/catalog/spell-catalog/api/spells.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

/** Lista completa — wizard / editores (DTO com description). */
export function useSpells() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...spellKeys.listAll(), editionSlugsParam ?? "all"],
    queryFn: () => fetchSpells(editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Só nome/nível/escola — ficha e labels. */
export function useSpellLabels(options?: { enabled?: boolean }) {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...spellKeys.labelsAll(), editionSlugsParam ?? "all"],
    queryFn: () => fetchSpellLabels(editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled: options?.enabled ?? true,
  });
}

export function useSpellsCatalog(params: {
  q?: string;
  level?: string;
  school?: string;
  ritual?: string;
  concentration?: string;
  roll?: string;
  castingTime?: string;
  saveAbility?: string;
  rangeKind?: string;
}) {
  return useCatalogCompendium({
    queryKey: spellKeys.all,
    fetchAll: (filters) =>
      fetchAllSpellsSummary({
        q: filters.q,
        level: filters.level,
        school: filters.school,
        ritual: filters.ritual,
        concentration: filters.concentration,
        roll: filters.roll,
        castingTime: filters.castingTime,
        saveAbility: filters.saveAbility,
        rangeKind: filters.rangeKind,
        editionSlugs: filters.editionSlugs,
      }),
    q: params.q,
    filters: {
      level: params.level,
      school: params.school,
      ritual: params.ritual,
      concentration: params.concentration,
      roll: params.roll,
      castingTime: params.castingTime,
      saveAbility: params.saveAbility,
      rangeKind: params.rangeKind,
    },
  });
}

export function useSpellDetail(slug: string) {
  return useCatalogDetailQuery({
    slug,
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
  });
}

export function useSangromancySpells(maxLevel?: number, enabled = true) {
  return useQuery({
    queryKey: [...spellKeys.all, "sangromancy", maxLevel ?? "all"],
    queryFn: async () => {
      const response = await fetchSangromancySpells(maxLevel);
      return {
        ...response,
        data: response.data.map(
          (spell): ClassSpellOption => ({
            slug: spell.slug,
            name: spell.name,
            level: spell.level,
            schoolSlug: spell.schoolSlug,
            schoolName: spell.schoolName,
          }),
        ),
      };
    },
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled,
  });
}
