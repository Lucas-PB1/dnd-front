import type { CatalogFilterField } from "@/shared/ui/catalog-filters";
import {
  MAGIC_ITEM_RARITY_FILTER,
  WEAPON_CATEGORY_FILTER,
} from "@/shared/lib/catalog-filter-options";

export type ShopSortValue =
  | ""
  | "name"
  | "name_desc"
  | "cost_asc"
  | "cost_desc";

export type ShopAdvancedFilters = {
  editionSlug: string;
  rarity: string;
  sort: ShopSortValue;
  requiresAttunement: "" | "true" | "false";
  coverageOnly: boolean;
  weaponCategory: string;
  catalogKind: string;
};

export const EMPTY_SHOP_ADVANCED_FILTERS: ShopAdvancedFilters = {
  editionSlug: "",
  rarity: "",
  sort: "",
  requiresAttunement: "",
  coverageOnly: false,
  weaponCategory: "",
  catalogKind: "",
};

export const SHOP_SORT_FILTER: CatalogFilterField = {
  key: "sort",
  label: "Ordenar",
  allLabel: "Nome (A–Z)",
  options: [
    { value: "name_desc", label: "Nome (Z–A)" },
    { value: "cost_asc", label: "Preço (menor)" },
    { value: "cost_desc", label: "Preço (maior)" },
  ],
};

export const SHOP_WEAPON_CATEGORY_FILTER: CatalogFilterField = {
  ...WEAPON_CATEGORY_FILTER,
  key: "weaponCategory",
};

export const SHOP_CATALOG_KIND_FILTER: CatalogFilterField = {
  key: "catalogKind",
  label: "Tipo avançado",
  options: [
    { value: "ammunition", label: "Munição avançada" },
    { value: "weapon-like-gear", label: "Equipamento (arma)" },
    { value: "armor-upgrade", label: "Melhoria de armadura" },
    { value: "spellcasting-focus", label: "Foco de conjuração" },
  ],
};

export const SHOP_ATTUNEMENT_FILTER: CatalogFilterField = {
  key: "requiresAttunement",
  label: "Sintonização",
  options: [
    { value: "true", label: "Exige sintonia" },
    { value: "false", label: "Sem exigência" },
  ],
};

export function countActiveShopAdvancedFilters(
  filters: ShopAdvancedFilters,
  hasCostOnly: boolean,
): number {
  let count = 0;
  if (filters.editionSlug) count += 1;
  if (filters.rarity) count += 1;
  if (filters.sort) count += 1;
  if (filters.requiresAttunement) count += 1;
  if (filters.coverageOnly) count += 1;
  if (filters.weaponCategory) count += 1;
  if (filters.catalogKind) count += 1;
  if (hasCostOnly) count += 1;
  return count;
}

export function shopAdvancedFilterLabels(
  filters: ShopAdvancedFilters,
  hasCostOnly: boolean,
  editionLabel?: string,
): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];
  if (filters.editionSlug) {
    chips.push({
      key: "editionSlug",
      label: editionLabel ? `Fonte: ${editionLabel}` : `Fonte: ${filters.editionSlug}`,
    });
  }
  if (filters.rarity) {
    const rarityLabel =
      MAGIC_ITEM_RARITY_FILTER.options.find(
        (row) => row.value === filters.rarity,
      )?.label ?? filters.rarity;
    chips.push({ key: "rarity", label: `Raridade: ${rarityLabel}` });
  }
  if (filters.sort === "name_desc") {
    chips.push({ key: "sort", label: "Nome Z–A" });
  } else if (filters.sort === "cost_asc") {
    chips.push({ key: "sort", label: "Preço ↑" });
  } else if (filters.sort === "cost_desc") {
    chips.push({ key: "sort", label: "Preço ↓" });
  }
  if (filters.requiresAttunement === "true") {
    chips.push({ key: "requiresAttunement", label: "Exige sintonia" });
  } else if (filters.requiresAttunement === "false") {
    chips.push({ key: "requiresAttunement", label: "Sem sintonia" });
  }
  if (filters.coverageOnly) {
    chips.push({ key: "coverageOnly", label: "Coberturas" });
  }
  if (filters.weaponCategory) {
    const label =
      SHOP_WEAPON_CATEGORY_FILTER.options.find(
        (row) => row.value === filters.weaponCategory,
      )?.label ?? filters.weaponCategory;
    chips.push({ key: "weaponCategory", label: `Arma: ${label}` });
  }
  if (filters.catalogKind) {
    const label =
      SHOP_CATALOG_KIND_FILTER.options.find(
        (row) => row.value === filters.catalogKind,
      )?.label ?? filters.catalogKind;
    chips.push({ key: "catalogKind", label: label });
  }
  if (hasCostOnly) {
    chips.push({ key: "hasCostOnly", label: "Com preço" });
  }
  return chips;
}

export function clearShopAdvancedFilterKey(
  filters: ShopAdvancedFilters,
  key: string,
): ShopAdvancedFilters {
  if (key === "editionSlug") return { ...filters, editionSlug: "" };
  if (key === "rarity") return { ...filters, rarity: "" };
  if (key === "sort") return { ...filters, sort: "" };
  if (key === "requiresAttunement") {
    return { ...filters, requiresAttunement: "" };
  }
  if (key === "coverageOnly") return { ...filters, coverageOnly: false };
  if (key === "weaponCategory") return { ...filters, weaponCategory: "" };
  if (key === "catalogKind") return { ...filters, catalogKind: "" };
  return filters;
}
