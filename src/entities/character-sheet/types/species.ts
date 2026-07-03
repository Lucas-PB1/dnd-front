import type { CharacterSpeciesId } from "@/entities/character-sheet/data/origins";

export type SpeciesTrait = {
  title: string;
  summary: string;
};

export type SpeciesDefinition = {
  id: CharacterSpeciesId;
  creatureType: string;
  speedFeet: number;
  speedLabel: string;
  sizeLabel: string;
  traits: SpeciesTrait[];
};
