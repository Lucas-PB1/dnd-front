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
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useSpecies() {
  return useQuery({
    queryKey: speciesKeys.list(),
    queryFn: () => fetchSpecies(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Compêndio: busca `q` na API. */
export function useSpeciesCatalog(params: { page: number; q?: string }) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q },
    queryKey: (p) =>
      speciesKeys.listPage({ page: p.page, limit: p.limit, q: p.q ?? "" }),
    queryFn: (p) =>
      fetchSpeciesPage({ page: p.page, limit: p.limit, q: p.q }),
  });
}

export function useSpeciesDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: speciesKeys.detail(slug),
    queryFn: () => fetchSpeciesBySlug(slug),
    enabled,
  });
}

export function useSpeciesTraits(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: speciesKeys.traits(slug),
    queryFn: () => fetchSpeciesTraits(slug),
    enabled,
  });
}

export function useSpeciesTraitChoices(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: speciesKeys.traitChoices(slug),
    queryFn: () => fetchSpeciesTraitChoices(slug),
    enabled,
  });
}
