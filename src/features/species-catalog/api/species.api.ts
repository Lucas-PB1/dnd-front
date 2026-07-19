import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SpeciesListResponse,
  SpeciesSummary,
  SpeciesTrait,
  SpeciesTraitChoice,
} from "@/entities/species/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export const speciesKeys = {
  all: ["species"] as const,
  list: () => [...speciesKeys.all, "list"] as const,
  listPage: (params: { page: number; limit: number; q: string }) =>
    [...speciesKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...speciesKeys.all, "detail", slug] as const,
  traits: (slug: string) => [...speciesKeys.all, "traits", slug] as const,
  traitChoices: (slug: string) =>
    [...speciesKeys.all, "trait-choices", slug] as const,
};

export async function fetchSpeciesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);

  return catalogFetch<SpeciesListResponse>(`/species?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchSpecies(limit = 50) {
  return fetchSpeciesPage({ page: 1, limit });
}

export async function fetchSpeciesBySlug(slug: string) {
  return catalogFetch<SpeciesSummary>(`/species/${slug}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchSpeciesTraits(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTrait>>(
    `/species/${slug}/traits`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSpeciesTraitChoices(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTraitChoice>>(
    `/species/${slug}/trait-choices`,
    { next: { revalidate: 3600 } },
  );
}
