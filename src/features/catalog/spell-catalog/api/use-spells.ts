"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAllSpellsSummary,
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
}) {
  return useCatalogCompendium({
    queryKey: spellKeys.all,
    fetchAll: (filters) =>
      fetchAllSpellsSummary({
        q: filters.q,
        level: filters.level,
        school: filters.school,
        editionSlugs: filters.editionSlugs,
      }),
    q: params.q,
    filters: { level: params.level, school: params.school },
  });
}

export function useSpellDetail(slug: string) {
  return useCatalogDetailQuery({
    slug,
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
  });
}
