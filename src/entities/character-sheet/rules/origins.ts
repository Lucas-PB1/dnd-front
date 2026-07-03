import {
  CHARACTER_ALIGNMENTS,
  PHB_2024_BACKGROUNDS,
  PHB_2024_SPECIES,
  type CharacterBackgroundId,
  type CharacterSpeciesId,
  type OriginOption,
} from "@/entities/character-sheet/data/origins";

export function findSpeciesName(speciesId: string): string {
  return (
    PHB_2024_SPECIES.find((species) => species.id === speciesId)?.name ??
    speciesId
  );
}

export function findBackgroundName(backgroundId: string): string {
  return (
    PHB_2024_BACKGROUNDS.find((background) => background.id === backgroundId)
      ?.name ?? backgroundId
  );
}

export function findAlignmentName(alignmentId: string): string {
  return (
    CHARACTER_ALIGNMENTS.find((alignment) => alignment.id === alignmentId)
      ?.name ?? alignmentId
  );
}

export {
  CHARACTER_ALIGNMENTS,
  PHB_2024_BACKGROUNDS,
  PHB_2024_SPECIES,
  type CharacterBackgroundId,
  type CharacterSpeciesId,
  type OriginOption,
};
