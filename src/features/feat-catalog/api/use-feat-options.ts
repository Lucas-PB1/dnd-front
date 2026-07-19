"use client";

import {
  featKeys,
  fetchFeatOptions,
} from "@/features/feat-catalog/api/feats.api";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useFeatOptions(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: featKeys.options(slug),
    queryFn: () => fetchFeatOptions(slug),
    enabled,
  });
}
