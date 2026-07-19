"use client";

import {
  fetchLanguageBySlug,
  fetchLanguagesPage,
  languageKeys,
} from "@/features/language-catalog/api/languages.api";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Compêndio: 20/página + busca e filtro raro/comum. */
export function useLanguagesCatalog(params: {
  page: number;
  q?: string;
  rare?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, rare: params.rare },
    queryKey: (p) =>
      languageKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        rare: p.rare ?? "",
      }),
    queryFn: (p) =>
      fetchLanguagesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        rare: p.rare,
      }),
  });
}

export function useLanguageDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: languageKeys.detail(slug),
    queryFn: () => fetchLanguageBySlug(slug),
    enabled,
  });
}
