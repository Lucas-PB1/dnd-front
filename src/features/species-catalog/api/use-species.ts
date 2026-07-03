"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpecies,
  fetchSpeciesBySlug,
  speciesKeys,
} from "@/features/species-catalog/api/species.api";

export function useSpecies() {
  return useQuery({
    queryKey: speciesKeys.list(),
    queryFn: () => fetchSpecies(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useSpeciesDetail(slug: string) {
  return useQuery({
    queryKey: speciesKeys.detail(slug),
    queryFn: () => fetchSpeciesBySlug(slug),
    staleTime: 60 * 60 * 1000,
  });
}
