"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchClasses } from "@/features/class-catalog/api/classes.api";
import {
  fetchSubclassBySlug,
  fetchSubclassMechanics,
  fetchSubclassesPage,
  subclassCatalogKeys,
} from "@/features/subclass-catalog/api/subclasses.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Compêndio: 20/página + busca e filtro por classe. */
export function useSubclassesCatalog(params: {
  page: number;
  q?: string;
  class?: string;
}) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const classSlug = params.class?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: subclassCatalogKeys.listPage({
      page,
      limit,
      q,
      class: classSlug,
    }),
    queryFn: () =>
      fetchSubclassesPage({
        page,
        limit,
        q: q || undefined,
        class: classSlug || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useSubclassClassOptions() {
  return useQuery({
    queryKey: ["classes", "list", "filter-options"] as const,
    queryFn: () => fetchClasses(50),
    staleTime: STALE,
  });
}

export function useSubclassDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: subclassCatalogKeys.detail(slug),
    queryFn: () => fetchSubclassBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSubclassMechanics(slug: string, enabled = true) {
  return useQuery({
    queryKey: subclassCatalogKeys.mechanics(slug),
    queryFn: () => fetchSubclassMechanics(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
