"use client";

import {
  fetchFightingStyleBySlug,
  fetchFightingStylesPage,
  fightingStyleKeys,
} from "@/features/fighting-style-catalog/api/fighting-styles.api";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useFightingStylesCatalog(params: {
  page: number;
  q?: string;
  classSlug?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, class: params.classSlug },
    queryKey: (p) =>
      fightingStyleKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        classSlug: p.class ?? "",
      }),
    queryFn: (p) =>
      fetchFightingStylesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        classSlug: p.class,
      }),
  });
}

export function useFightingStyleDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: fightingStyleKeys.detail(slug),
    queryFn: () => fetchFightingStyleBySlug(slug),
    enabled,
  });
}
