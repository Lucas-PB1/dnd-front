"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAllSpecies,
  fetchSpeciesBySlug,
  fetchSpeciesTraitChoices,
  fetchSpeciesTraits,
  speciesKeys,
} from "@/features/catalog/species-catalog/api/species.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

/** Listagem slim para selects do wizard (sem description). */
export function useSpecies() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...speciesKeys.list(), "summary", editionSlugsParam ?? "all"],
    queryFn: () => fetchAllSpecies({ editionSlugs: editionSlugsParam, fields: "summary" }),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useSpeciesCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: speciesKeys.all,
    fetchAll: fetchAllSpecies,
    q: params?.q,
  });
}

export function useSpeciesDetail(slug: string, enabled = true) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogDetailQuery({
    slug,
    queryKey: speciesKeys.detail(slug, editionSlugsParam),
    queryFn: () => fetchSpeciesBySlug(slug, editionSlugsParam),
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
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogDetailQuery({
    slug,
    queryKey: speciesKeys.traitChoices(slug, editionSlugsParam),
    queryFn: () => fetchSpeciesTraitChoices(slug, editionSlugsParam),
    enabled,
  });
}
