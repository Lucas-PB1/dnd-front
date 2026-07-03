import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  ClassListResponse,
  ClassSummary,
  SubclassListResponse,
} from "@/entities/class/types";

export const classKeys = {
  all: ["classes"] as const,
  list: () => [...classKeys.all, "list"] as const,
  detail: (slug: string) => [...classKeys.all, "detail", slug] as const,
  subclasses: (slug: string) => [...classKeys.all, "subclasses", slug] as const,
};

export async function fetchClasses(limit = 50) {
  return catalogFetch<ClassListResponse>(`/classes?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
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
