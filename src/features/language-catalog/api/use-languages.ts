"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchLanguageBySlug,
  fetchLanguagesPage,
  languageKeys,
} from "@/features/language-catalog/api/languages.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Compêndio: 20/página + busca e filtro raro/comum. */
export function useLanguagesCatalog(params: {
  page: number;
  q?: string;
  rare?: string;
}) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const rare = params.rare?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: languageKeys.listPage({ page, limit, q, rare }),
    queryFn: () =>
      fetchLanguagesPage({
        page,
        limit,
        q: q || undefined,
        rare: rare || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useLanguageDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: languageKeys.detail(slug),
    queryFn: () => fetchLanguageBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
