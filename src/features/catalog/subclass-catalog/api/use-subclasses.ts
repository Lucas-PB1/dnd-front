"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchClasses } from "@/features/catalog/class-catalog/api/classes.api";
import {
  fetchSubclassBySlug,
  fetchSubclassesPage,
  subclassCatalogKeys,
} from "@/features/catalog/subclass-catalog/api/subclasses.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
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
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: {
      q: params.q,
      class: params.class,
      editionSlugs: editionSlugsParam,
    },
    queryKey: (p) =>
      subclassCatalogKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        class: p.class ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchSubclassesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        class: p.class,
        editionSlugs: p.editionSlugs,
      }),
  });
}

export function useSubclassClassOptions() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: ["classes", "list", "filter-options", editionSlugsParam ?? "all"] as const,
    queryFn: () => fetchClasses(50, editionSlugsParam),
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
