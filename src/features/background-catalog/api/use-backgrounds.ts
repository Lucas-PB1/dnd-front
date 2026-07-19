"use client";

import { useQuery } from "@tanstack/react-query";

import {
  backgroundKeys,
  fetchBackgroundBySlug,
  fetchBackgroundEquipment,
  fetchBackgroundSkills,
  fetchBackgroundTools,
  fetchBackgrounds,
  fetchBackgroundsPage,
} from "@/features/background-catalog/api/backgrounds.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Lista completa — wizard / ficha. */
export function useBackgrounds() {
  return useQuery({
    queryKey: backgroundKeys.listAll(),
    queryFn: () => fetchBackgrounds(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Listagem do compêndio: 20/página + busca `q` na API. */
export function useBackgroundsCatalog(params: { page: number; q?: string }) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q },
    queryKey: (p) =>
      backgroundKeys.listPage({ page: p.page, limit: p.limit, q: p.q ?? "" }),
    queryFn: (p) =>
      fetchBackgroundsPage({ page: p.page, limit: p.limit, q: p.q }),
  });
}

export function useBackgroundDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.detail(slug),
    queryFn: () => fetchBackgroundBySlug(slug),
    enabled,
  });
}

export function useBackgroundEquipment(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.equipment(slug),
    queryFn: () => fetchBackgroundEquipment(slug),
    enabled,
  });
}

export function useBackgroundTools(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.tools(slug),
    queryFn: () => fetchBackgroundTools(slug),
    enabled,
    retry: false,
  });
}

export function useBackgroundSkills(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.skills(slug),
    queryFn: () => fetchBackgroundSkills(slug),
    enabled,
    retry: false,
  });
}
