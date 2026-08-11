"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchFeatLabels } from "@/features/catalog/feat-catalog/api/feats.api";
import {
  fetchAbilities,
  fetchAbilityGenerationMethods,
  fetchAlignments,
  fetchCharacterLevels,
  fetchCombatMechanicalCatalog,
  fetchConditions,
  fetchFeats,
  fetchLanguages,
  fetchSkills,
  referenceKeys,
} from "@/features/catalog/reference-catalog/api/reference.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS, CATALOG_LIST_STALE_MS } from "@/shared/lib/catalog-query";

export function useSkills() {
  return useQuery({
    queryKey: referenceKeys.skills(),
    queryFn: () => fetchSkills(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useFeats() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...referenceKeys.feats(), editionSlugsParam ?? "all"],
    queryFn: () => fetchFeats(100, editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useFeatLabels(options?: { enabled?: boolean }) {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...referenceKeys.feats(), "labels", editionSlugsParam ?? "all"],
    queryFn: () => fetchFeatLabels(editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled: options?.enabled ?? true,
  });
}

export function useAlignments(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: referenceKeys.alignments(),
    queryFn: () => fetchAlignments(),
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled: options?.enabled ?? true,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: referenceKeys.languages(),
    queryFn: () => fetchLanguages(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useConditions() {
  return useQuery({
    queryKey: referenceKeys.conditions(),
    queryFn: () => fetchConditions(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useAbilities() {
  return useQuery({
    queryKey: referenceKeys.abilities(),
    queryFn: () => fetchAbilities(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useAbilityGenerationMethods() {
  return useQuery({
    queryKey: referenceKeys.abilityGenerationMethods(),
    queryFn: () => fetchAbilityGenerationMethods(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useCharacterLevels() {
  return useQuery({
    queryKey: referenceKeys.characterLevels(),
    queryFn: () => fetchCharacterLevels(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useCombatMechanicalCatalog(filters?: {
  classSlug?: string;
  subclassSlug?: string | null;
  /** Default true. Use false to skip fetch (ex.: card de arma sem Rogue). */
  enabled?: boolean;
}) {
  const classSlug = filters?.classSlug?.trim() || undefined;
  const subclassSlug = filters?.subclassSlug?.trim() || undefined;
  const enabled = filters?.enabled ?? true;
  return useQuery({
    queryKey: referenceKeys.combatMechanicalCatalog({
      classSlug,
      subclassSlug,
    }),
    queryFn: () =>
      fetchCombatMechanicalCatalog({ classSlug, subclassSlug }),
    // Mesa: reseed e texto jogável — não ficar 1h com catálogo velho.
    staleTime: CATALOG_LIST_STALE_MS,
    enabled,
  });
}
