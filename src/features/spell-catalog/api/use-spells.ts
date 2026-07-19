"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpellBySlug,
  fetchSpells,
  fetchSpellsPage,
  spellKeys,
} from "@/features/spell-catalog/api/spells.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Lista completa — wizard / ficha / editores. */
export function useSpells() {
  return useQuery({
    queryKey: spellKeys.listAll(),
    queryFn: () => fetchSpells(),
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
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, level: params.level, school: params.school },
    queryKey: (p) =>
      spellKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        level: p.level ?? "",
        school: p.school ?? "",
      }),
    queryFn: (p) =>
      fetchSpellsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        level: p.level,
        school: p.school,
      }),
  });
}

export function useSpellDetail(slug: string) {
  return useCatalogDetailQuery({
    slug,
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
  });
}
