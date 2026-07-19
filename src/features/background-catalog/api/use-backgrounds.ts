"use client";

import { useQuery } from "@tanstack/react-query";

import {
  backgroundKeys,
  fetchBackgroundBySlug,
  fetchBackgroundEquipment,
  fetchBackgroundSkills,
  fetchBackgroundTools,
  fetchBackgrounds,
  fetchBackgroundsPage,
} from "@/features/background-catalog/api/backgrounds.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

/** Lista completa — wizard / ficha. */
export function useBackgrounds() {
  return useQuery({
    queryKey: backgroundKeys.listAll(),
    queryFn: () => fetchBackgrounds(),
    staleTime: STALE,
  });
}

/** Listagem do compêndio: 20/página + busca `q` na API. */
export function useBackgroundsCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: backgroundKeys.listPage({ page, limit, q }),
    queryFn: () => fetchBackgroundsPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useBackgroundDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.detail(slug),
    queryFn: () => fetchBackgroundBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useBackgroundEquipment(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.equipment(slug),
    queryFn: () => fetchBackgroundEquipment(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useBackgroundTools(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.tools(slug),
    queryFn: () => fetchBackgroundTools(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
    retry: false,
  });
}

export function useBackgroundSkills(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.skills(slug),
    queryFn: () => fetchBackgroundSkills(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
    retry: false,
  });
}
