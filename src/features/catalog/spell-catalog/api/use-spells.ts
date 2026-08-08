"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpellBySlug,
  fetchSpellLabels,
  fetchSpells,
  fetchSpellsPage,
  spellKeys,
} from "@/features/catalog/spell-catalog/api/spells.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";
import type { SpellListResponse } from "@/entities/spell/types";

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
export function useSpellLabels() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...spellKeys.labelsAll(), editionSlugsParam ?? "all"],
    queryFn: () => fetchSpellLabels(editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Listagem do compêndio: 20/página + busca/filtros na API. */
export function useSpellsCatalog(params: {
  page: number;
  q?: string;
  level?: string;
  school?: string;
}) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: {
      q: params.q,
      level: params.level,
      school: params.school,
      editionSlugs: editionSlugsParam,
    },
    queryKey: (p) =>
      spellKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        level: p.level ?? "",
        school: p.school ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchSpellsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        level: p.level,
        school: p.school,
        editionSlugs: p.editionSlugs,
      }) as Promise<SpellListResponse>,
  });
}

export function useSpellDetail(slug: string) {
  return useCatalogDetailQuery({
    slug,
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
  });
}
