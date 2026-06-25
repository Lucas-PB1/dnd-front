import type { SpeciesDefinition } from "@/domain/character-sheet/types/species";

import { PHB_2024_SPECIES_DETAILS_PART_ONE } from "./part-one";
import { PHB_2024_SPECIES_DETAILS_PART_TWO } from "./part-two";

export const PHB_2024_SPECIES_DETAILS: SpeciesDefinition[] = [
  ...PHB_2024_SPECIES_DETAILS_PART_ONE,
  ...PHB_2024_SPECIES_DETAILS_PART_TWO,
];
