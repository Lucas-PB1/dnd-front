import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  ClassEquipmentOption,
  ClassListResponse,
  ClassSkillOption,
  ClassSpellOption,
  ClassSpellSlots,
  ClassFeature,
  ClassSummary,
  SubclassListResponse,
  SubclassMechanic,
  SubclassOptionGroup,
  SubclassSpellOption,
} from "@/entities/class/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export const classKeys = {
  all: ["classes"] as const,
  list: () => [...classKeys.all, "list"] as const,
  listPage: (params: { page: number; limit: number; q: string }) =>
    [...classKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...classKeys.all, "detail", slug] as const,
  subclasses: (slug: string) => [...classKeys.all, "subclasses", slug] as const,
  skills: (slug: string) => [...classKeys.all, "skills", slug] as const,
  equipment: (slug: string) => [...classKeys.all, "equipment", slug] as const,
  spellSlots: (slug: string) =>
    [...classKeys.all, "spell-slots", slug] as const,
  features: (slug: string, maxLevel?: number) =>
    [...classKeys.all, "features", slug, maxLevel ?? "all"] as const,
  spells: (slug: string, maxLevel?: number) =>
    [...classKeys.all, "spells", slug, maxLevel ?? "all"] as const,
};

export const subclassKeys = {
  all: ["subclasses"] as const,
  mechanics: (slug: string) =>
    [...subclassKeys.all, "mechanics", slug] as const,
  spells: (slug: string) => [...subclassKeys.all, "spells", slug] as const,
  options: (slug: string, level: number) =>
    [...subclassKeys.all, "options", slug, level] as const,
};

export async function fetchClassesPage(params?: {
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

  return catalogFetch<ClassListResponse>(`/classes?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchClasses(limit = 50) {
  return fetchClassesPage({ page: 1, limit });
}

export async function fetchClassBySlug(slug: string) {
  return catalogFetch<ClassSummary>(`/classes/${slug}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchClassSubclasses(slug: string, limit = 50) {
  return catalogFetch<SubclassListResponse>(
    `/classes/${slug}/subclasses?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchClassSkills(slug: string) {
  return catalogFetch<PaginatedResponse<ClassSkillOption>>(
    `/classes/${slug}/skills`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchClassEquipment(slug: string) {
  return catalogFetch<PaginatedResponse<ClassEquipmentOption>>(
    `/classes/${slug}/equipment`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchClassFeatures(
  slug: string,
  maxLevel?: number,
  limit = 100,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (maxLevel !== undefined) {
    params.set("maxLevel", String(maxLevel));
  }
  return catalogFetch<PaginatedResponse<ClassFeature>>(
    `/classes/${slug}/features?${params}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchClassSpells(
  slug: string,
  maxLevel?: number,
  limit = 100,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (maxLevel !== undefined) {
    params.set("maxLevel", String(maxLevel));
  }
  return catalogFetch<PaginatedResponse<ClassSpellOption>>(
    `/classes/${slug}/spells?${params}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchClassSpellSlots(slug: string, limit = 20) {
  return catalogFetch<PaginatedResponse<ClassSpellSlots>>(
    `/classes/${slug}/spell-slots?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSubclassMechanics(slug: string, limit = 50) {
  return catalogFetch<PaginatedResponse<SubclassMechanic>>(
    `/subclasses/${slug}/mechanics?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSubclassSpells(slug: string) {
  return catalogFetch<PaginatedResponse<SubclassSpellOption>>(
    `/subclasses/${slug}/spells`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSubclassOptions(
  slug: string,
  level: number,
  limit = 50,
) {
  return catalogFetch<PaginatedResponse<SubclassOptionGroup>>(
    `/subclasses/${slug}/options?level=${level}&limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}
