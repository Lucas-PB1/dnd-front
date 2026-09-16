import {
  buildCatalogFilterField,
  catalogFilterOptionsFromNamed,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export const WEAPON_CATEGORY_FILTER_OPTIONS: CatalogNamedOption[] = [
  { slug: "simple", name: "Simples" },
  { slug: "martial", name: "Marcial" },
  { slug: "advanced", name: "Avançada" },
];

export function buildWeaponCategoryFilter(
  categories: readonly CatalogNamedOption[] = WEAPON_CATEGORY_FILTER_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "category",
    "Categoria",
    catalogFilterOptionsFromNamed(categories),
  );
}
