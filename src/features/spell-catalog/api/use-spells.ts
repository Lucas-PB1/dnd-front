"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpellBySlug,
  fetchSpells,
  fetchSpellsPage,
  spellKeys,
} from "@/features/spell-catalog/api/spells.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

/** Lista completa — wizard / ficha / editores. */
export function useSpells() {
  return useQuery({
    queryKey: spellKeys.listAll(),
    queryFn: () => fetchSpells(),
    staleTime: 60 * 60 * 1000,
  });
}

/** Listagem do compêndio: 20/página + busca `q` na API. */
export function useSpellsCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: spellKeys.listPage({ page, limit, q }),
    queryFn: () => fetchSpellsPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useSpellDetail(slug: string) {
  return useQuery({
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
    staleTime: 60 * 60 * 1000,
  });
}
