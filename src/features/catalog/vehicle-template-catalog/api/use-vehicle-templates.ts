"use client";

import {
  fetchAllVehicleTemplates,
  fetchVehicleTemplateBySlug,
  vehicleTemplateKeys,
} from "@/features/catalog/vehicle-template-catalog/api/vehicle-templates.api";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useVehicleTemplatesCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: vehicleTemplateKeys.all,
    fetchAll: fetchAllVehicleTemplates,
    q: params?.q,
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
