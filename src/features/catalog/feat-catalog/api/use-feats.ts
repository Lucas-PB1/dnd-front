"use client";

import {
  featKeys,
  fetchFeatBySlug,
  fetchFeatsPage,
} from "@/features/catalog/feat-catalog/api/feats.api";
import type { FeatListResponse } from "@/entities/feat/types";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Compêndio: 20/página + busca/filtros na API. */
export function useFeatsCatalog(params: {
  page: number;
  q?: string;
  category?: string;
}) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: {
      q: params.q,
      category: params.category,
      editionSlugs: editionSlugsParam,
    },
    queryKey: (p) =>
      featKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        category: p.category ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchFeatsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        category: p.category,
        editionSlugs: p.editionSlugs,
      }) as Promise<FeatListResponse>,
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
