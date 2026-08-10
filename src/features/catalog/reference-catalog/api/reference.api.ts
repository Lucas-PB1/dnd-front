import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { AbilitySummary } from "@/entities/ability/types";
import type { AbilityGenerationMethod } from "@/entities/ability-generation-method/types";
import type { AlignmentListResponse } from "@/entities/alignment/types";
import type { CharacterLevel } from "@/entities/character-level/types";
import type { CombatMechanicalCatalog } from "@/entities/combat-mechanical/types";
import type { ConditionSummary } from "@/entities/condition/types";
import type { FeatListResponse } from "@/entities/feat/types";
import type { LanguageListResponse } from "@/entities/language/types";
import type { SkillListResponse } from "@/entities/skill/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import { CATALOG_FETCH_INIT, buildCatalogSearchParams } from "@/shared/lib/catalog-query";

export const referenceKeys = {
  all: ["reference"] as const,
  skills: () => [...referenceKeys.all, "skills"] as const,
  feats: () => [...referenceKeys.all, "feats"] as const,
  alignments: () => [...referenceKeys.all, "alignments"] as const,
  languages: () => [...referenceKeys.all, "languages"] as const,
  conditions: () => [...referenceKeys.all, "conditions"] as const,
  abilities: () => [...referenceKeys.all, "abilities"] as const,
  abilityGenerationMethods: () =>
    [...referenceKeys.all, "ability-generation-methods"] as const,
  characterLevels: () => [...referenceKeys.all, "character-levels"] as const,
  combatMechanicalCatalog: (filters?: {
    classSlug?: string;
    subclassSlug?: string;
  }) =>
    [
      ...referenceKeys.all,
      "combat-mechanical-catalog",
      "v2-playable-desc",
      filters?.classSlug ?? "all",
      filters?.subclassSlug ?? "all",
    ] as const,
};

export async function fetchSkills(limit = 100) {
  return catalogFetch<SkillListResponse>(
    `/skills?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchFeats(limit = 100, editionSlugs?: string) {
  const search = buildCatalogSearchParams({
    page: 1,
    limit,
    filters: { editionSlugs },
  });
  return catalogFetch<FeatListResponse>(
    `/feats?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAlignments(limit = 50) {
  return catalogFetch<AlignmentListResponse>(
    `/alignments?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchLanguages(limit = 100) {
  return catalogFetch<LanguageListResponse>(
    `/languages?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchConditions() {
  return catalogFetch<ConditionSummary[]>(`/conditions`, CATALOG_FETCH_INIT);
}

export async function fetchAbilityGenerationMethods() {
  return catalogFetch<AbilityGenerationMethod[]>(
    `/ability-generation-methods`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAbilities(limit = 20) {
  return catalogFetch<PaginatedResponse<AbilitySummary>>(
    `/abilities?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchCharacterLevels(limit = 20) {
  return catalogFetch<PaginatedResponse<CharacterLevel>>(
    `/character-levels?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchCombatMechanicalCatalog(filters?: {
  classSlug?: string;
  subclassSlug?: string;
}) {
  const search = buildCatalogSearchParams({
    page: 1,
    limit: 1,
    filters: {
      classSlug: filters?.classSlug,
      subclassSlug: filters?.subclassSlug,
    },
  });
  // Endpoint não é paginado; remove page/limit do query string.
  search.delete("page");
  search.delete("limit");
  const qs = search.toString();
  // Catálogo de mesa muda com reseed — não usar Next Data Cache de 1h.
  return catalogFetch<CombatMechanicalCatalog>(
    qs ? `/combat-mechanical-catalog?${qs}` : `/combat-mechanical-catalog`,
    { cache: "no-store" },
  );
}
