"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSpellBySlug,
  fetchSpells,
  spellKeys,
} from "@/features/spell-catalog/api/spells.api";

export function useSpells() {
  return useQuery({
    queryKey: spellKeys.list(),
    queryFn: () => fetchSpells(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useSpellDetail(slug: string) {
  return useQuery({
    queryKey: spellKeys.detail(slug),
    queryFn: () => fetchSpellBySlug(slug),
    staleTime: 60 * 60 * 1000,
  });
}
