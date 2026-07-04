import type { CharacterFeat } from "@/entities/character/sheet-types";
import { appendCharacterFeat } from "@/entities/character/lib/character-feat";

export function asiFeatSlotsToCharacterFeats(
  slotSlugs: string[],
): CharacterFeat[] {
  let feats: CharacterFeat[] = [];
  for (const slug of slotSlugs) {
    if (!slug.trim()) continue;
    feats = appendCharacterFeat(feats, slug.trim());
  }
  return feats;
}
