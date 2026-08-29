"use client";

import {
  fetchAllSkills,
  fetchSkillBySlug,
  skillKeys,
} from "@/features/catalog/skill-catalog/api/skills.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useSkillsCatalog(params: { q?: string; ability?: string }) {
  return useCatalogCompendium({
    queryKey: skillKeys.all,
    fetchAll: fetchAllSkills,
    q: params.q,
    filters: { ability: params.ability },
    editionScoped: false,
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
