import {
  buildCatalogFilterField,
  catalogFilterOptionsFromNamed,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export function buildWeaponCategoryFilter(
  categories: readonly CatalogNamedOption[] = [],
): CatalogFilterField {
  return buildCatalogFilterField(
    "category",
    "Categoria",
    catalogFilterOptionsFromNamed(categories),
  );
}
