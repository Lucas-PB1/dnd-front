"use client";

import {
  fetchVehicleTemplateBySlug,
  fetchVehicleTemplatesPage,
  vehicleTemplateKeys,
} from "@/features/catalog/vehicle-template-catalog/api/vehicle-templates.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useVehicleTemplatesCatalog(params: { page: number; q?: string }) {
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, editionSlugs: editionSlugsParam },
    queryKey: (p) =>
      vehicleTemplateKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        editionSlugs: p.editionSlugs,
      }),
    queryFn: (p) =>
      fetchVehicleTemplatesPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        editionSlugs: p.editionSlugs,
        fields: "summary",
      }),
  });
}

export function useVehicleTemplateDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: vehicleTemplateKeys.detail(slug),
    queryFn: () => fetchVehicleTemplateBySlug(slug),
    enabled,
  });
}
