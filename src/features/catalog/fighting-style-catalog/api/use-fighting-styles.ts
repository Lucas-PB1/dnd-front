"use client";

import {
  fetchAllFightingStyles,
  fetchFightingStyleBySlug,
  fightingStyleKeys,
} from "@/features/catalog/fighting-style-catalog/api/fighting-styles.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useFightingStylesCatalog(params: {
  q?: string;
  classSlug?: string;
}) {
  return useCatalogCompendium({
    queryKey: fightingStyleKeys.all,
    fetchAll: (filters) =>
      fetchAllFightingStyles({
        q: filters.q,
        class: filters.class,
      }),
    q: params.q,
    filters: { class: params.classSlug },
    editionScoped: false,
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
