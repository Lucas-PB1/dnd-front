"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import type { FeatSummary } from "@/entities/feat/types";
import {
  featKeys,
  fetchFeatBySlug,
} from "@/features/feat-catalog/api/feats.api";

const STALE = 60 * 60 * 1000;

export function useFeatDetails(slugs: string[]) {
  const uniqueSlugs = useMemo(
    () => [...new Set(slugs.filter(Boolean))],
    [slugs],
  );

  const queries = useQueries({
    queries: uniqueSlugs.map((slug) => ({
      queryKey: featKeys.detail(slug),
      queryFn: () => fetchFeatBySlug(slug),
      staleTime: STALE,
      enabled: !!slug,
    })),
  });

  const featBySlug = useMemo(() => {
    const map: Record<string, FeatSummary> = {};
    uniqueSlugs.forEach((slug, index) => {
      const feat = queries[index]?.data;
      if (feat) map[slug] = feat;
    });
    return map;
  }, [uniqueSlugs, queries]);

  const isLoading = queries.some((query) => query.isPending);

  return { featBySlug, isLoading };
}
