"use client";

import {
  featKeys,
  fetchFeatBySlug,
  fetchFeatsPage,
} from "@/features/feat-catalog/api/feats.api";
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
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, category: params.category },
    queryKey: (p) =>
      featKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        category: p.category ?? "",
      }),
    queryFn: (p) =>
      fetchFeatsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        category: p.category,
      }),
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
