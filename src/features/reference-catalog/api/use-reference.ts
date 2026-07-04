"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAbilityGenerationMethods,
  fetchAlignments,
  fetchFeats,
  fetchLanguages,
  fetchSkills,
  referenceKeys,
} from "@/features/reference-catalog/api/reference.api";

const STALE = 60 * 60 * 1000;

export function useSkills() {
  return useQuery({
    queryKey: referenceKeys.skills(),
    queryFn: () => fetchSkills(),
    staleTime: STALE,
  });
}

export function useFeats() {
  return useQuery({
    queryKey: referenceKeys.feats(),
    queryFn: () => fetchFeats(),
    staleTime: STALE,
  });
}

export function useAlignments() {
  return useQuery({
    queryKey: referenceKeys.alignments(),
    queryFn: () => fetchAlignments(),
    staleTime: STALE,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: referenceKeys.languages(),
    queryFn: () => fetchLanguages(),
    staleTime: STALE,
  });
}

export function useAbilityGenerationMethods() {
  return useQuery({
    queryKey: referenceKeys.abilityGenerationMethods(),
    queryFn: () => fetchAbilityGenerationMethods(),
    staleTime: STALE,
  });
}
