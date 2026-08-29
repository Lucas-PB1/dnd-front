"use client";

import {
  fetchAllLanguages,
  fetchLanguageBySlug,
  languageKeys,
} from "@/features/catalog/language-catalog/api/languages.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useLanguagesCatalog(params: { q?: string; rare?: string }) {
  return useCatalogCompendium({
    queryKey: languageKeys.all,
    fetchAll: fetchAllLanguages,
    q: params.q,
    filters: { rare: params.rare },
    editionScoped: false,
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
