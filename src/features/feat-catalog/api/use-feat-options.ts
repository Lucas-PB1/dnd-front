"use client";

import { useQuery } from "@tanstack/react-query";

import {
  featKeys,
  fetchFeatOptions,
} from "@/features/feat-catalog/api/feats.api";

const STALE = 60 * 60 * 1000;

export function useFeatOptions(slug: string, enabled = true) {
  return useQuery({
    queryKey: featKeys.options(slug),
    queryFn: () => fetchFeatOptions(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
