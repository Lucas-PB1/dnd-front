export type SpeciesChoiceRef = {
  choiceKind: string;
  choiceSlug: string;
};

export const DWARF_CULTURE_KIND = "dwarf_culture";

const CULTURE_TO_TRAIT_PACKAGE: Record<string, string> = {
  phb: "dwarf",
  baugsmidr: "baugsmidr-dwarf",
  fjord: "fjord-dwarf",
};

export function resolveDwarfCulture(
  speciesSlug: string,
  speciesChoices?: readonly SpeciesChoiceRef[],
): string | null {
  if (speciesSlug !== "dwarf") return null;
  return (
    speciesChoices?.find((c) => c.choiceKind === DWARF_CULTURE_KIND)
      ?.choiceSlug ?? null
  );
}

export function resolveTraitPackageSlug(
  speciesSlug: string,
  speciesChoices?: readonly SpeciesChoiceRef[],
): string {
  if (speciesSlug !== "dwarf") return speciesSlug;
  const culture = resolveDwarfCulture(speciesSlug, speciesChoices);
  if (!culture || culture === "phb") return "dwarf";
  return CULTURE_TO_TRAIT_PACKAGE[culture] ?? "dwarf";
}
