import { buildCatalogFilterField } from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export function buildRareFilter(): CatalogFilterField {
  return buildCatalogFilterField("rare", "Raridade", [
    { value: "true", label: "Raros" },
    { value: "false", label: "Comuns" },
  ]);
}
