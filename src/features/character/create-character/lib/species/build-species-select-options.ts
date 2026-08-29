import type { SearchableSelectOption } from "@/shared/ui/searchable-select";

type SpeciesOptionSource = {
  slug: string;
  name: string;
};

/** Lista espécies jogáveis (a API já exclui pacotes de traços internos). */
export function buildSpeciesSelectOptions(
  species: SpeciesOptionSource[],
): SearchableSelectOption[] {
  return [...species]
    .sort((a, b) => a.name.localeCompare(b.name, "pt"))
    .map((s) => ({ value: s.slug, label: s.name }));
}
