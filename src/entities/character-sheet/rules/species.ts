import type {
  SpeciesDefinition,
  SpeciesTrait,
} from "@/entities/character-sheet/types/species";
import { PHB_2024_SPECIES_DETAILS } from "@/entities/character-sheet/data/species/index";

export function findSpeciesDetails(
  speciesId: string,
): SpeciesDefinition | undefined {
  return PHB_2024_SPECIES_DETAILS.find((species) => species.id === speciesId);
}

export function formatSpeciesTrait(trait: SpeciesTrait): string {
  return `${trait.title} — ${trait.summary}`;
}

export function formatSpeciesTraitsText(species: SpeciesDefinition): string {
  return species.traits.map(formatSpeciesTrait).join("\n");
}

export function getSpeciesSheetDefaults(speciesId: string): {
  speed: string;
  size: string;
  speciesTraits: string;
} | null {
  const species = findSpeciesDetails(speciesId);
  if (!species) {
    return null;
  }

  return {
    speed: species.speedLabel,
    size: species.sizeLabel,
    speciesTraits: formatSpeciesTraitsText(species),
  };
}
