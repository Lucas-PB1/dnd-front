"use client";

import {
  creatureTemplateKeys,
  fetchCreatureTemplateBySlug,
  fetchCreatureTemplatesPage,
} from "@/features/catalog/creature-template-catalog/api/creature-templates.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useCreatureTemplatesCatalog(params: { page: number; q?: string }) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, editionSlugs: editionSlugsParam },
    queryKey: (p) =>
      creatureTemplateKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchCreatureTemplatesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        editionSlugs: p.editionSlugs,
        fields: "summary",
      }),
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
