"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpecies,
  fetchSpeciesBySlug,
  fetchSpeciesTraitChoices,
  fetchSpeciesTraits,
  speciesKeys,
} from "@/features/species-catalog/api/species.api";

const STALE = 60 * 60 * 1000;

export function useSpecies() {
  return useQuery({
    queryKey: speciesKeys.list(),
    queryFn: () => fetchSpecies(),
    staleTime: STALE,
  });
}

export function useSpeciesDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: speciesKeys.detail(slug),
    queryFn: () => fetchSpeciesBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSpeciesTraits(slug: string, enabled = true) {
  return useQuery({
    queryKey: speciesKeys.traits(slug),
    queryFn: () => fetchSpeciesTraits(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSpeciesTraitChoices(slug: string, enabled = true) {
  return useQuery({
    queryKey: speciesKeys.traitChoices(slug),
    queryFn: () => fetchSpeciesTraitChoices(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
