import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  BackgroundEquipmentOption,
  BackgroundListResponse,
  BackgroundSkillOption,
  BackgroundSummary,
  BackgroundToolOption,
} from "@/entities/background/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export const backgroundKeys = {
  all: ["backgrounds"] as const,
  listAll: () => [...backgroundKeys.all, "list", "all"] as const,
  listPage: (params: { page: number; limit: number; q: string }) =>
    [...backgroundKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...backgroundKeys.all, "detail", slug] as const,
  equipment: (slug: string) =>
    [...backgroundKeys.all, "equipment", slug] as const,
  skills: (slug: string) => [...backgroundKeys.all, "skills", slug] as const,
  tools: (slug: string) => [...backgroundKeys.all, "tools", slug] as const,
};

export async function fetchBackgroundsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);

  return catalogFetch<BackgroundListResponse>(
    `/backgrounds?${search.toString()}`,
    { next: { revalidate: 3600 } },
  );
}

/** Lista completa (poucos itens) — wizard / ficha. */
export async function fetchBackgrounds(limit = 50) {
  return fetchBackgroundsPage({ page: 1, limit });
}

export async function fetchBackgroundBySlug(slug: string) {
  return catalogFetch<BackgroundSummary>(`/backgrounds/${slug}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchBackgroundEquipment(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundEquipmentOption>>(
    `/backgrounds/${slug}/equipment`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchBackgroundSkills(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundSkillOption>>(
    `/backgrounds/${slug}/skills`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchBackgroundTools(slug: string, limit = 50) {
  return catalogFetch<PaginatedResponse<BackgroundToolOption>>(
    `/backgrounds/${slug}/tools?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}
