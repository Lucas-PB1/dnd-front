"use client";

import {
  featKeys,
  fetchAllFeatsSummary,
  fetchFeatBySlug,
} from "@/features/catalog/feat-catalog/api/feats.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useFeatsCatalog(params: { q?: string; category?: string }) {
  return useCatalogCompendium({
    queryKey: featKeys.all,
    fetchAll: (filters) =>
      fetchAllFeatsSummary({
        q: filters.q,
        category: filters.category,
        editionSlugs: filters.editionSlugs,
      }),
    q: params.q,
    filters: { category: params.category },
  });
}

export function useFeatDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: featKeys.detail(slug),
    queryFn: () => fetchFeatBySlug(slug),
    enabled,
  });
}
