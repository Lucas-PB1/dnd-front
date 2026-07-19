"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpecies,
  fetchSpeciesBySlug,
  fetchSpeciesPage,
  fetchSpeciesTraitChoices,
  fetchSpeciesTraits,
  speciesKeys,
} from "@/features/species-catalog/api/species.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

export function useSpecies() {
  return useQuery({
    queryKey: speciesKeys.list(),
    queryFn: () => fetchSpecies(),
    staleTime: STALE,
  });
}

/** Compêndio: busca `q` na API. */
export function useSpeciesCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: speciesKeys.listPage({ page, limit, q }),
    queryFn: () => fetchSpeciesPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
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
