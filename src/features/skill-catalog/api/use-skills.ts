"use client";

import {
  fetchSkillBySlug,
  fetchSkillsPage,
  skillKeys,
} from "@/features/skill-catalog/api/skills.api";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

/** Compêndio: 20/página + busca e filtro por atributo. */
export function useSkillsCatalog(params: {
  page: number;
  q?: string;
  ability?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, ability: params.ability },
    queryKey: (p) =>
      skillKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        ability: p.ability ?? "",
      }),
    queryFn: (p) =>
      fetchSkillsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        ability: p.ability,
      }),
  });
}

export function useSkillDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: skillKeys.detail(slug),
    queryFn: () => fetchSkillBySlug(slug),
    enabled,
  });
}
