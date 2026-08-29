"use client";

import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import {
  creatureTemplateKeys,
  fetchAllCreatureTemplates,
  fetchCreatureTemplateBySlug,
} from "@/features/catalog/creature-template-catalog/api/creature-templates.api";

export function useCreatureTemplatesCatalog(params?: {
  q?: string;
}) {
  return useCatalogCompendium({
    queryKey: creatureTemplateKeys.all,
    fetchAll: fetchAllCreatureTemplates,
    q: params?.q,
  });
}

export function useCreatureTemplateDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: creatureTemplateKeys.detail(slug),
    queryFn: () => fetchCreatureTemplateBySlug(slug),
    enabled,
  });
}
