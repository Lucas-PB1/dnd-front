import type { CharacterFeat } from "@/entities/character/sheet-types";
import { nextCharacterFeatInstanceIndex } from "@/entities/character/lib/character-feat";

/** Espelha resolveBackgroundOriginCharacterFeats da API (sem legado featSlugs). */
export function previewCreateCharacterFeats(
  backgroundOriginSlug: string | null | undefined,
  asiFeats: CharacterFeat[],
): CharacterFeat[] {
  const feats = [...asiFeats];
  const origin = backgroundOriginSlug?.trim();
  if (origin && !feats.some((feat) => feat.featSlug === origin)) {
    feats.unshift({
      featSlug: origin,
      instanceIndex: nextCharacterFeatInstanceIndex(feats, origin),
    });
  }
  return feats;
}
