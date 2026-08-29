"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAllClasses } from "@/features/catalog/class-catalog/api/classes.api";
import {
  fetchAllSubclasses,
  fetchSubclassBySlug,
  subclassCatalogKeys,
} from "@/features/catalog/subclass-catalog/api/subclasses.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useSubclassesCatalog(params: {
  q?: string;
  class?: string;
}) {
  return useCatalogCompendium({
    queryKey: subclassCatalogKeys.all,
    fetchAll: (filters) =>
      fetchAllSubclasses({
        q: filters.q,
        class: filters.class,
        editionSlugs: filters.editionSlugs,
      }),
    q: params.q,
    filters: { class: params.class },
  });
}

export function useSubclassClassOptions() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: ["classes", "list", "filter-options", editionSlugsParam ?? "all"] as const,
    queryFn: () => fetchAllClasses({ editionSlugs: editionSlugsParam }),
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
