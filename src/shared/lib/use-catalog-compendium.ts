"use client";

import { useQuery } from "@tanstack/react-query";

import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import { CATALOG_LIST_STALE_MS } from "@/shared/lib/catalog-query";

export type CatalogCompendiumFetchParams = {
  q?: string;
  editionSlugs?: string;
  [key: string]: string | undefined;
};

function trimFilters(
  filters?: Record<string, string | undefined>,
): Record<string, string> {
  if (!filters) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    const trimmed = value?.trim() ?? "";
    if (trimmed) out[key] = trimmed;
  }
  return out;
}

function hasActiveFilters(
  q: string,
  filters: Record<string, string>,
): boolean {
  return q.length > 0 || Object.keys(filters).length > 0;
}

type UseCatalogCompendiumArgs<T> = {
  queryKey: readonly unknown[];
  fetchAll: (
    params: CatalogCompendiumFetchParams,
  ) => Promise<PaginatedResponse<T>>;
  q?: string;
  filters?: Record<string, string | undefined>;
  /** Inclui `editionSlugs` do escopo ativo (padrão: true). */
  editionScoped?: boolean;
};

/** Compêndio: cache separado para lista completa vs busca/filtros (cursor na API). */
export function useCatalogCompendium<T>({
  queryKey,
  fetchAll,
  q,
  filters,
  editionScoped = true,
}: UseCatalogCompendiumArgs<T>) {
  const { editionSlugsParam } = useCatalogSources();
  const trimmedQ = q?.trim() ?? "";
  const normalizedFilters = trimFilters(filters);
  const filtered = hasActiveFilters(trimmedQ, normalizedFilters);
  const editionSlugs = editionScoped ? editionSlugsParam : undefined;

  const allQuery = useQuery({
    queryKey: [
      ...queryKey,
      "compendium",
      "all",
      editionScoped ? (editionSlugs ?? "all") : "all",
    ] as const,
    queryFn: () => fetchAll({ editionSlugs }),
    staleTime: CATALOG_LIST_STALE_MS,
    enabled: !filtered,
  });

  const filteredQuery = useQuery({
    queryKey: [
      ...queryKey,
      "compendium",
      "filtered",
      editionScoped ? (editionSlugs ?? "all") : "all",
      trimmedQ,
      normalizedFilters,
    ] as const,
    queryFn: () =>
      fetchAll({
        q: trimmedQ || undefined,
        editionSlugs,
        ...normalizedFilters,
      }),
    staleTime: CATALOG_LIST_STALE_MS,
    enabled: filtered,
  });

  return filtered ? filteredQuery : allQuery;
}
