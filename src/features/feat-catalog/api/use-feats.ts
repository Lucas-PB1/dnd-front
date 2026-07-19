"use client";

import { useQuery } from "@tanstack/react-query";

import {
  featKeys,
  fetchFeatBySlug,
  fetchFeatsPage,
} from "@/features/feat-catalog/api/feats.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Compêndio: 20/página + busca/filtros na API. */
export function useFeatsCatalog(params: {
  page: number;
  q?: string;
  category?: string;
}) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: featKeys.listPage({ page, limit, q, category }),
    queryFn: () =>
      fetchFeatsPage({
        page,
        limit,
        q: q || undefined,
        category: category || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useFeatDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: featKeys.detail(slug),
    queryFn: () => fetchFeatBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
