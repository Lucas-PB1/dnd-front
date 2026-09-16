import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import { CATALOG_FETCH_INIT } from "@/shared/lib/catalog-query";
import type { CatalogNamedOption } from "@/shared/lib/build-catalog-filter-field";

export type CatalogNamedLabel = CatalogNamedOption & {
  sortOrder?: number;
};

export type FeatCategoryLabel = CatalogNamedLabel & {
  typeLabel: string;
};

export type ToolPoolKind = "instrument" | "gaming" | "artisan";

export type ToolPoolResponse = {
  pool: ToolPoolKind;
  items: CatalogNamedLabel[];
};

export const catalogLabelKeys = {
  all: ["catalog-labels"] as const,
  spellSchools: () => [...catalogLabelKeys.all, "spell-schools"] as const,
  featCategories: () => [...catalogLabelKeys.all, "feat-categories"] as const,
  weaponCategories: () =>
    [...catalogLabelKeys.all, "weapon-categories"] as const,
  armorCategories: () => [...catalogLabelKeys.all, "armor-categories"] as const,
  itemTypes: () => [...catalogLabelKeys.all, "item-types"] as const,
  toolPools: () => [...catalogLabelKeys.all, "tool-pools"] as const,
};

export function fetchSpellSchools() {
  return catalogFetch<CatalogNamedLabel[]>(
    "/spell-schools",
    CATALOG_FETCH_INIT,
  );
}

export function fetchFeatCategories() {
  return catalogFetch<FeatCategoryLabel[]>(
    "/feat-categories",
    CATALOG_FETCH_INIT,
  );
}

export function fetchWeaponCategories() {
  return catalogFetch<CatalogNamedLabel[]>(
    "/weapon-categories",
    CATALOG_FETCH_INIT,
  );
}

export function fetchArmorCategories() {
  return catalogFetch<CatalogNamedLabel[]>(
    "/armor-categories",
    CATALOG_FETCH_INIT,
  );
}

export function fetchItemTypes() {
  return catalogFetch<CatalogNamedLabel[]>(
    "/item-types",
    CATALOG_FETCH_INIT,
  );
}

export function fetchToolPools() {
  return catalogFetch<ToolPoolResponse[]>("/tool-pools", CATALOG_FETCH_INIT);
}

export function toolPoolsCatalogFromResponse(
  pools: readonly ToolPoolResponse[] | undefined,
): Record<ToolPoolKind, CatalogNamedLabel[]> {
  const next: Record<ToolPoolKind, CatalogNamedLabel[]> = {
    instrument: [],
    gaming: [],
    artisan: [],
  };
  for (const row of pools ?? []) {
    next[row.pool] = row.items;
  }
  return next;
}
