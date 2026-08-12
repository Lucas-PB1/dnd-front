import type { SearchableSelectOption } from "@/shared/ui/searchable-select";

type SpeciesOptionSource = {
  slug: string;
  name: string;
  variantOf?: string | null;
};

/** Agrupa variantes sob a espécie-base; órfãs ficam no fim com hint. */
export function buildSpeciesSelectOptions(
  species: SpeciesOptionSource[],
): SearchableSelectOption[] {
  const bySlug = new Map(species.map((s) => [s.slug, s]));
  const bases = species.filter((s) => !s.variantOf);
  const variants = species.filter((s) => s.variantOf);
  const used = new Set<string>();
  const options: SearchableSelectOption[] = [];

  const byName = (a: SpeciesOptionSource, b: SpeciesOptionSource) =>
    a.name.localeCompare(b.name, "pt");

  for (const base of [...bases].sort(byName)) {
    options.push({ value: base.slug, label: base.name });
    used.add(base.slug);
    for (const variant of variants
      .filter((v) => v.variantOf === base.slug)
      .sort(byName)) {
      options.push({
        value: variant.slug,
        label: variant.name,
        hint: `Variante de ${base.name}`,
      });
      used.add(variant.slug);
    }
  }

  for (const orphan of variants.filter((v) => !used.has(v.slug)).sort(byName)) {
    const baseName = bySlug.get(orphan.variantOf ?? "")?.name ?? orphan.variantOf;
    options.push({
      value: orphan.slug,
      label: orphan.name,
      hint: baseName ? `Variante de ${baseName}` : "Variante",
    });
  }

  return options;
}
