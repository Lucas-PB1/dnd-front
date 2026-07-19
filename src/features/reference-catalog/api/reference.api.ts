import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { AlignmentListResponse } from "@/entities/alignment/types";
import type { FeatListResponse } from "@/entities/feat/types";
import type { LanguageListResponse } from "@/entities/language/types";
import type { SkillListResponse } from "@/entities/skill/types";

export const referenceKeys = {
  all: ["reference"] as const,
  skills: () => [...referenceKeys.all, "skills"] as const,
  feats: () => [...referenceKeys.all, "feats"] as const,
  alignments: () => [...referenceKeys.all, "alignments"] as const,
  languages: () => [...referenceKeys.all, "languages"] as const,
};

export async function fetchSkills(limit = 100) {
  return catalogFetch<SkillListResponse>(`/skills?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchFeats(limit = 100) {
  return catalogFetch<FeatListResponse>(`/feats?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchAlignments(limit = 50) {
  return catalogFetch<AlignmentListResponse>(`/alignments?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchLanguages(limit = 100) {
  return catalogFetch<LanguageListResponse>(`/languages?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}
