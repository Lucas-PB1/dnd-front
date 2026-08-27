import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  VehicleTemplateDetail,
  VehicleTemplateListResponse,
} from "@/entities/vehicle-template/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";

export const vehicleTemplateKeys = {
  all: ["vehicle-templates"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    editionSlugs?: string;
  }) => [...vehicleTemplateKeys.all, "list", "page", params] as const,
  detail: (slug: string) =>
    [...vehicleTemplateKeys.all, "detail", slug] as const,
};

export async function fetchVehicleTemplatesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields ?? "summary",
    },
  });

  return catalogFetch<VehicleTemplateListResponse>(
    `/vehicle-templates?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchVehicleTemplateBySlug(slug: string) {
  return catalogFetch<VehicleTemplateDetail>(
    `/vehicle-templates/${slug}`,
    CATALOG_FETCH_INIT,
  );
}
