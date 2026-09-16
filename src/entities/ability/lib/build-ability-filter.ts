import type { AbilitySummary } from "@/entities/ability/types";
import { buildCatalogFilterField } from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export function buildAbilityFilter(
  abilities: readonly AbilitySummary[],
): CatalogFilterField {
  return buildCatalogFilterField(
    "ability",
    "Atributo",
    [...abilities]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((ability) => ({ value: ability.slug, label: ability.name })),
  );
}
