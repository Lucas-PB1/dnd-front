"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSkillBySlug,
  fetchSkillsPage,
  skillKeys,
} from "@/features/skill-catalog/api/skills.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Compêndio: 20/página + busca e filtro por atributo. */
export function useSkillsCatalog(params: {
  page: number;
  q?: string;
  ability?: string;
}) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const ability = params.ability?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: skillKeys.listPage({ page, limit, q, ability }),
    queryFn: () =>
      fetchSkillsPage({
        page,
        limit,
        q: q || undefined,
        ability: ability || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useSkillDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: skillKeys.detail(slug),
    queryFn: () => fetchSkillBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
