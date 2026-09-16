import {
  buildCatalogFilterField,
  catalogFilterOptionsFromNamed,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export const FEAT_CATEGORY_OPTIONS: CatalogNamedOption[] = [
  { slug: "origin", name: "Origem" },
  { slug: "general", name: "Geral" },
  { slug: "fighting-style", name: "Estilo de Luta" },
  { slug: "epic-boon", name: "Dádiva Épica" },
  { slug: "gh-transformation", name: "Transformação GH" },
];

export function buildFeatCategoryFilter(
  categories: readonly CatalogNamedOption[] = FEAT_CATEGORY_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "category",
    "Categoria",
    catalogFilterOptionsFromNamed(categories),
  );
}
