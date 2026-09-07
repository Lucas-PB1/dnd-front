"use client";

import {
  featKeys,
  fetchAllFeats,
  fetchFeatBySlug,
  fetchFeatEffects,
} from "@/features/catalog/feat-catalog/api/feats.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

const FEAT_DETAIL_STALE_MS = 5 * 60 * 1000;

export function useFeatsCatalog(params: { q?: string; category?: string }) {
  return useCatalogCompendium({
    queryKey: featKeys.all,
    fetchAll: (filters) =>
      fetchAllFeats({
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
    staleTime: FEAT_DETAIL_STALE_MS,
  });
}

export function useFeatEffects(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: featKeys.effects(slug),
    queryFn: () => fetchFeatEffects(slug),
    enabled,
    staleTime: FEAT_DETAIL_STALE_MS,
  });
}
