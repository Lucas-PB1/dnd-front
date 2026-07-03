import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SpellListResponse, SpellSummary } from "@/entities/spell/types";

export const spellKeys = {
  all: ["spells"] as const,
  list: () => [...spellKeys.all, "list"] as const,
  detail: (slug: string) => [...spellKeys.all, "detail", slug] as const,
};

export async function fetchSpells(limit = 100) {
  return catalogFetch<SpellListResponse>(`/spells?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchSpellBySlug(slug: string) {
  return catalogFetch<SpellSummary>(`/spells/${slug}`, {
    next: { revalidate: 3600 },
  });
}
