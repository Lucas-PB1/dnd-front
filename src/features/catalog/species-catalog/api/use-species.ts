"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpecies,
  fetchSpeciesBySlug,
  fetchSpeciesPage,
  fetchSpeciesTraitChoices,
  fetchSpeciesTraits,
  speciesKeys,
} from "@/features/catalog/species-catalog/api/species.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useSpecies() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...speciesKeys.list(), editionSlugsParam ?? "all"],
    queryFn: () => fetchSpecies(50, editionSlugsParam),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Compêndio: busca `q` na API. */
export function useSpeciesCatalog(params: { page: number; q?: string }) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, editionSlugs: editionSlugsParam },
    queryKey: (p) =>
      speciesKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchSpeciesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        editionSlugs: p.editionSlugs,
      }),
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
