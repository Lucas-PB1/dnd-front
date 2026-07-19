"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchClasses } from "@/features/class-catalog/api/classes.api";
import {
  fetchSubclassBySlug,
  fetchSubclassesPage,
  subclassCatalogKeys,
} from "@/features/subclass-catalog/api/subclasses.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Compêndio: 20/página + busca e filtro por classe. */
export function useSubclassesCatalog(params: {
  page: number;
  q?: string;
  class?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, class: params.class },
    queryKey: (p) =>
      subclassCatalogKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        class: p.class ?? "",
      }),
    queryFn: (p) =>
      fetchSubclassesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        class: p.class,
      }),
  });
}

export function useSubclassClassOptions() {
  return useQuery({
    queryKey: ["classes", "list", "filter-options"] as const,
    queryFn: () => fetchClasses(50),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useSubclassDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: subclassCatalogKeys.detail(slug),
    queryFn: () => fetchSubclassBySlug(slug),
    enabled,
  });
}
