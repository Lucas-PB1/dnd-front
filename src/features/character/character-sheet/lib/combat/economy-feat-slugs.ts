import { isFightingStyleSubclassOptionKey } from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import type { CharacterDetail } from "@/entities/character/types";

export function economyFeatSlugsFromCharacter(
  character: Pick<
    CharacterDetail,
    "transformation" | "characterFeats" | "subclassOptions"
  >,
): string[] {
  const fightingStyleSlugs = (character.subclassOptions ?? [])
    .filter((option) => isFightingStyleSubclassOptionKey(option.optionKey))
    .map((option) => option.valueId);

  return [
    ...(character.transformation?.slug ? [character.transformation.slug] : []),
    ...(character.characterFeats?.map((feat) => feat.featSlug) ?? []),
    ...fightingStyleSlugs,
  ];
}
