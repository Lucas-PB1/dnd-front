"use client";

import { useQuery } from "@tanstack/react-query";

import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import {
  characterThreadKeys,
  fetchAllCharacterThreads,
  fetchCharacterThreadBySlug,
  fetchCharacterThreads,
} from "./character-threads.api";

export function useCharacterThreadCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: characterThreadKeys.all,
    fetchAll: (p) => fetchAllCharacterThreads({ ...p, fields: "summary" }),
    q: params?.q,
  });
}

export function useCharacterThreads(enabled = true) {
  return useQuery({
    queryKey: characterThreadKeys.listAll(),
    queryFn: () => fetchCharacterThreads(50),
    enabled,
    staleTime: 60_000,
  });
}

export function useCharacterThreadDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: characterThreadKeys.detail(slug),
    queryFn: () => fetchCharacterThreadBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 60_000,
  });
}
