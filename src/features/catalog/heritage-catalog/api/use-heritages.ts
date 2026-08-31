"use client";

import { useQuery } from "@tanstack/react-query";

import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import type { HeritageSummary } from "@/entities/heritage/types";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import {
  fetchAllHeritages,
  fetchHeritageBySlug,
  fetchHeritageTraitChoices,
  fetchHeritageTraditionalBuild,
  fetchHeritageModularTraits,
  heritageKeys,
} from "./heritages.api";

export function useHeritages(enabled = true) {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery<HeritageSummary[]>({
    queryKey: [...heritageKeys.list(), "summary", editionSlugsParam ?? "all"],
    queryFn: async () =>
      (await fetchAllHeritages({
        editionSlugs: editionSlugsParam,
        fields: "summary",
      })).data,
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled,
  });
}

export function useHeritageCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: heritageKeys.all,
    fetchAll: (p) => fetchAllHeritages({ ...p, includeCatalogOnly: true }),
    q: params?.q,
  });
}

export function useHeritageDetail(slug: string, enabled = true) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogDetailQuery({
    slug,
    queryKey: heritageKeys.detail(slug, editionSlugsParam),
    queryFn: () => fetchHeritageBySlug(slug, editionSlugsParam),
    enabled,
  });
}

export function useHeritageModularTraits(slug: string, enabled = true) {
  return useQuery({
    queryKey: heritageKeys.modularTraits(slug),
    queryFn: async () => {
      const response = await fetchHeritageModularTraits(slug);
      return response.data;
    },
    enabled: enabled && Boolean(slug),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useHeritageTraitChoices(slug: string, enabled = true) {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: heritageKeys.traitChoices(slug, editionSlugsParam),
    queryFn: async () => {
      const response = await fetchHeritageTraitChoices(slug, editionSlugsParam);
      return response.data;
    },
    enabled: enabled && Boolean(slug),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useHeritageTraditionalBuild(slug: string, enabled = true) {
  return useQuery({
    queryKey: heritageKeys.traditional(slug),
    queryFn: async () => {
      const response = await fetchHeritageTraditionalBuild(slug);
      return response.data;
    },
    enabled: enabled && Boolean(slug),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
