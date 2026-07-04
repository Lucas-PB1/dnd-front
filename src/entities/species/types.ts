import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type SpeciesSummary = {
  slug: string;
  name: string;
  creatureType: string;
  size: string;
  speed: string;
  description: string;
};

export type SpeciesListResponse = PaginatedResponse<SpeciesSummary>;

/** Espelha SpeciesTraitResponseDto */
export type SpeciesTrait = {
  name: string;
  description: string;
  choiceKind: string | null;
};

/** Espelha SpeciesTraitChoiceResponseDto */
export type SpeciesTraitChoice = {
  traitName: string;
  choiceKind: string;
  choiceSlug: string;
  choiceName: string;
  level1Benefit: string | null;
  spellLevel3Slug: string | null;
  spellLevel5Slug: string | null;
  damageType: string | null;
};
