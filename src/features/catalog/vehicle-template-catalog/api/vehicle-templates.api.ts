import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  VehicleTemplateDetail,
  VehicleTemplateListResponse,
} from "@/entities/vehicle-template/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";

const FETCH_PAGE_SIZE = 100;

export const vehicleTemplateKeys = {
  all: ["vehicle-templates"] as const,
  detail: (slug: string) =>
    [...vehicleTemplateKeys.all, "detail", slug] as const,
};

export async function fetchVehicleTemplatesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    cursor: params?.cursor,
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

export async function fetchAllVehicleTemplates(params?: {
  q?: string;
  editionSlugs?: string;
}) {
  return fetchAllCatalogPages<VehicleTemplateListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchVehicleTemplatesPage({
        page,
        limit,
        cursor,
        q: params?.q,
        editionSlugs: params?.editionSlugs,
        fields: "summary",
      }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchVehicleTemplateBySlug(slug: string) {
  return catalogFetch<VehicleTemplateDetail>(
    `/vehicle-templates/${slug}`,
    CATALOG_FETCH_INIT,
  );
}
