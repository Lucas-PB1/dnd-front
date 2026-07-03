"use client";

import { useQuery } from "@tanstack/react-query";

import {
  backgroundKeys,
  fetchBackgroundBySlug,
  fetchBackgrounds,
} from "@/features/background-catalog/api/backgrounds.api";

export function useBackgrounds() {
  return useQuery({
    queryKey: backgroundKeys.list(),
    queryFn: () => fetchBackgrounds(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useBackgroundDetail(slug: string) {
  return useQuery({
    queryKey: backgroundKeys.detail(slug),
    queryFn: () => fetchBackgroundBySlug(slug),
    staleTime: 60 * 60 * 1000,
  });
}
