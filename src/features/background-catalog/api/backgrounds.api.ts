import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  BackgroundListResponse,
  BackgroundSummary,
} from "@/entities/background/types";

export const backgroundKeys = {
  all: ["backgrounds"] as const,
  list: () => [...backgroundKeys.all, "list"] as const,
  detail: (slug: string) => [...backgroundKeys.all, "detail", slug] as const,
};

export async function fetchBackgrounds(limit = 50) {
  return catalogFetch<BackgroundListResponse>(`/backgrounds?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchBackgroundBySlug(slug: string) {
  return catalogFetch<BackgroundSummary>(`/backgrounds/${slug}`, {
    next: { revalidate: 3600 },
  });
}
