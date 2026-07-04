"use client";

import { useQuery } from "@tanstack/react-query";

import {
  backgroundKeys,
  fetchBackgroundBySlug,
  fetchBackgroundEquipment,
  fetchBackgroundSkills,
  fetchBackgroundTools,
  fetchBackgrounds,
} from "@/features/background-catalog/api/backgrounds.api";

const STALE = 60 * 60 * 1000;

export function useBackgrounds() {
  return useQuery({
    queryKey: backgroundKeys.list(),
    queryFn: () => fetchBackgrounds(),
    staleTime: STALE,
  });
}

export function useBackgroundDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.detail(slug),
    queryFn: () => fetchBackgroundBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useBackgroundEquipment(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.equipment(slug),
    queryFn: () => fetchBackgroundEquipment(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useBackgroundTools(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.tools(slug),
    queryFn: () => fetchBackgroundTools(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
    retry: false,
  });
}

export function useBackgroundSkills(slug: string, enabled = true) {
  return useQuery({
    queryKey: backgroundKeys.skills(slug),
    queryFn: () => fetchBackgroundSkills(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
    retry: false,
  });
}
