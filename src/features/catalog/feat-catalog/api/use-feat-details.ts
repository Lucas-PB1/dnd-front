"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { FeatSummary } from "@/entities/feat/types";
import {
  featKeys,
  fetchFeatsBySlugs,
} from "@/features/catalog/feat-catalog/api/feats.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useFeatDetails(slugs: string[]) {
  const uniqueSlugs = useMemo(
    () => [...new Set(slugs.filter(Boolean))],
    [slugs],
  );

  const query = useQuery({
    queryKey: featKeys.bySlugs(uniqueSlugs),
    queryFn: () => fetchFeatsBySlugs(uniqueSlugs),
    staleTime: CATALOG_DETAIL_STALE_MS,
    enabled: uniqueSlugs.length > 0,
  });

  const featBySlug = useMemo(() => {
    const map: Record<string, FeatSummary> = {};
    for (const feat of query.data ?? []) {
      map[feat.slug] = feat;
    }
    return map;
  }, [query.data]);

  return { featBySlug, isLoading: query.isPending && uniqueSlugs.length > 0 };
}
