import type {
  CatalogFilterField,
  CatalogFilterOption,
} from "@/shared/ui/catalog-filters";

export type CatalogNamedOption = {
  slug: string;
  name: string;
};

export function catalogFilterOptionsFromNamed(
  rows: readonly CatalogNamedOption[],
): CatalogFilterOption[] {
  return rows.map((row) => ({ value: row.slug, label: row.name }));
}

export function buildCatalogFilterField(
  key: string,
  label: string,
  options: readonly CatalogFilterOption[],
  allLabel?: string,
): CatalogFilterField {
  const field: CatalogFilterField = {
    key,
    label,
    options: [...options],
  };
  if (allLabel != null) {
    field.allLabel = allLabel;
  }
  return field;
}
