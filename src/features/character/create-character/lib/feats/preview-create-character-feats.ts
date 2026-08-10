import type { CharacterFeat } from "@/entities/character/sheet-types";
import type { SpeciesChoice } from "@/entities/character/sheet-types";
import type { ClassOption } from "@/entities/character/sheet-types";
import { nextCharacterFeatInstanceIndex } from "@/entities/character/lib/character-feat";
import {
  isLessonsOfTheFirstOnesSlug,
  readEldritchInvocationPicks,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";

export const HUMAN_ORIGIN_FEAT_KIND = "human_origin_feat";

/** Espelha resolveBackgroundOriginCharacterFeats + resolveHumanOriginCharacterFeats + Lessons na API. */
export function resolveCreateCharacterFeats(
  backgroundOriginSlug: string | null | undefined,
  asiFeats: CharacterFeat[],
  speciesChoices: SpeciesChoice[] = [],
  classOptions: ClassOption[] = [],
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

  for (const pick of readEldritchInvocationPicks(classOptions)) {
    if (!isLessonsOfTheFirstOnesSlug(pick.slug) || !pick.originFeatSlug) {
      continue;
    }
    if (feats.some((feat) => feat.featSlug === pick.originFeatSlug)) continue;
    feats.push({
      featSlug: pick.originFeatSlug,
      instanceIndex: nextCharacterFeatInstanceIndex(
        feats,
        pick.originFeatSlug,
      ),
    });
  }

  return feats;
}
