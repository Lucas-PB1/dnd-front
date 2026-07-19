"use client";

import { useQuery } from "@tanstack/react-query";

import {
  featKeys,
  fetchFeatBySlug,
  fetchFeats,
  fetchFeatsPage,
} from "@/features/feat-catalog/api/feats.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Lista ampla — wizard / ficha. */
export function useFeatsList() {
  return useQuery({
    queryKey: featKeys.listAll(),
    queryFn: () => fetchFeats(),
    staleTime: STALE,
  });
}

/** Compêndio: 20/página + busca na API. */
export function useFeatsCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: featKeys.listPage({ page, limit, q }),
    queryFn: () => fetchFeatsPage({ page, limit, q: q || undefined }),
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
