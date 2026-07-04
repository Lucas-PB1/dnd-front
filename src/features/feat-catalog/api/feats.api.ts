import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { FeatOptionListResponse } from "@/entities/feat/types";
import type { FeatSummary } from "@/entities/feat/types";

export const featKeys = {
  all: ["feats"] as const,
  detail: (slug: string) => [...featKeys.all, slug] as const,
  options: (slug: string) => [...featKeys.all, slug, "options"] as const,
};

export async function fetchFeatBySlug(slug: string) {
  return catalogFetch<FeatSummary>(`/feats/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchFeatOptions(slug: string, limit = 50) {
  return catalogFetch<FeatOptionListResponse>(
    `/feats/${encodeURIComponent(slug)}/options?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}
