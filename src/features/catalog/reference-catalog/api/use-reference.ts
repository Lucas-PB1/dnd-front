"use client";

import { useQuery } from "@tanstack/react-query";

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
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

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

export function useAlignments() {
  return useQuery({
    queryKey: referenceKeys.alignments(),
    queryFn: () => fetchAlignments(),
    staleTime: CATALOG_DETAIL_STALE_MS,
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

export function useCombatMechanicalCatalog() {
  return useQuery({
    queryKey: referenceKeys.combatMechanicalCatalog(),
    queryFn: () => fetchCombatMechanicalCatalog(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
