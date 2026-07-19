import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { AlignmentListResponse } from "@/entities/alignment/types";
import type { FeatListResponse } from "@/entities/feat/types";
import type { LanguageListResponse } from "@/entities/language/types";
import type { SkillListResponse } from "@/entities/skill/types";
import { CATALOG_FETCH_INIT } from "@/shared/lib/catalog-query";

export const referenceKeys = {
  all: ["reference"] as const,
  skills: () => [...referenceKeys.all, "skills"] as const,
  feats: () => [...referenceKeys.all, "feats"] as const,
  alignments: () => [...referenceKeys.all, "alignments"] as const,
  languages: () => [...referenceKeys.all, "languages"] as const,
};

export async function fetchSkills(limit = 100) {
  return catalogFetch<SkillListResponse>(
    `/skills?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchFeats(limit = 100) {
  return catalogFetch<FeatListResponse>(
    `/feats?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAlignments(limit = 50) {
  return catalogFetch<AlignmentListResponse>(
    `/alignments?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchLanguages(limit = 100) {
  return catalogFetch<LanguageListResponse>(
    `/languages?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}
