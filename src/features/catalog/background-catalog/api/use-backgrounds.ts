"use client";

import { useQuery } from "@tanstack/react-query";

import {
  backgroundKeys,
  fetchAllBackgrounds,
  fetchBackgroundBySlug,
  fetchBackgroundEquipment,
  fetchBackgroundLanguages,
  fetchBackgroundSkills,
  fetchBackgroundTools,
} from "@/features/catalog/background-catalog/api/backgrounds.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

/** Listagem slim para selects do wizard (sem description). */
export function useBackgrounds() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [
      ...backgroundKeys.listAll(),
      "summary",
      editionSlugsParam ?? "all",
    ],
    queryFn: () =>
      fetchAllBackgrounds({ editionSlugs: editionSlugsParam, fields: "summary" }),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useBackgroundsCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: backgroundKeys.all,
    fetchAll: fetchAllBackgrounds,
    q: params?.q,
  });
}

export function useBackgroundDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.detail(slug),
    queryFn: () => fetchBackgroundBySlug(slug),
    enabled,
  });
}

export function useBackgroundEquipment(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.equipment(slug),
    queryFn: () => fetchBackgroundEquipment(slug),
    enabled,
  });
}

export function useBackgroundTools(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.tools(slug),
    queryFn: () => fetchBackgroundTools(slug),
    enabled,
    retry: false,
  });
}

export function useBackgroundSkills(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.skills(slug),
    queryFn: () => fetchBackgroundSkills(slug),
    enabled,
    retry: false,
  });
}

export function useBackgroundLanguages(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: backgroundKeys.languages(slug),
    queryFn: () => fetchBackgroundLanguages(slug),
    enabled,
    retry: false,
  });
}
