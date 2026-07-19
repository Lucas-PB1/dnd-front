"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAlignments,
  fetchFeats,
  fetchLanguages,
  fetchSkills,
  referenceKeys,
} from "@/features/reference-catalog/api/reference.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useSkills() {
  return useQuery({
    queryKey: referenceKeys.skills(),
    queryFn: () => fetchSkills(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useFeats() {
  return useQuery({
    queryKey: referenceKeys.feats(),
    queryFn: () => fetchFeats(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useAlignments() {
  return useQuery({
    queryKey: referenceKeys.alignments(),
    queryFn: () => fetchAlignments(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: referenceKeys.languages(),
    queryFn: () => fetchLanguages(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
