import type { CharacterFeat } from "@/entities/character/sheet-types";
import type { SpeciesChoice } from "@/entities/character/sheet-types";
import { nextCharacterFeatInstanceIndex } from "@/entities/character/lib/character-feat";

const HUMAN_ORIGIN_FEAT_KIND = "human_origin_feat";

/** Espelha resolveBackgroundOriginCharacterFeats + resolveHumanOriginCharacterFeats na API. */
export function resolveCreateCharacterFeats(
  backgroundOriginSlug: string | null | undefined,
  asiFeats: CharacterFeat[],
  speciesChoices: SpeciesChoice[] = [],
): CharacterFeat[] {
  const feats = [...asiFeats];
  const origin = backgroundOriginSlug?.trim();
  if (origin && !feats.some((feat) => feat.featSlug === origin)) {
    feats.unshift({
      featSlug: origin,
      instanceIndex: nextCharacterFeatInstanceIndex(feats, origin),
    });
  }

  const humanFeat = speciesChoices.find(
    (choice) => choice.choiceKind === HUMAN_ORIGIN_FEAT_KIND,
  );
  if (
    humanFeat?.choiceSlug &&
    !feats.some((feat) => feat.featSlug === humanFeat.choiceSlug)
  ) {
    feats.push({
      featSlug: humanFeat.choiceSlug,
      instanceIndex: nextCharacterFeatInstanceIndex(
        feats,
        humanFeat.choiceSlug,
      ),
    });
  }

  return feats;
}
