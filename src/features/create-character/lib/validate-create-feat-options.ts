import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import { featInstanceKey } from "@/entities/character/lib/character-feat";
import { fetchFeatOptions } from "@/features/feat-catalog/api/feats.api";
import { requiredFeatOptionDefsForInstance } from "@/features/create-character/lib/feat-option-requirements";
import { proficiencyBonusForLevel } from "@/features/create-character/lib/proficiency-bonus-for-level";

export async function findIncompleteCreateFeatOptions(
  characterFeats: CharacterFeat[],
  featOptions: FeatOption[],
  featNameBySlug: Record<string, string> = {},
  characterLevel = 1,
): Promise<string | null> {
  const proficiencyBonus = proficiencyBonusForLevel(characterLevel);

  for (const feat of characterFeats) {
    const response = await fetchFeatOptions(feat.featSlug);
    const defs = response.data ?? [];
    if (defs.length === 0) continue;

    const instanceOpts = featOptions.filter(
      (option) =>
        option.featSlug === feat.featSlug &&
        option.instanceIndex === feat.instanceIndex,
    );

    const applicable = requiredFeatOptionDefsForInstance(
      feat.featSlug,
      defs,
      proficiencyBonus,
      instanceOpts,
    );

    const provided = new Set(
      featOptions
        .filter(
          (option) =>
            option.featSlug === feat.featSlug &&
            option.instanceIndex === feat.instanceIndex,
        )
        .map((option) => option.optionKey),
    );

    const missing = applicable.filter((def) => !provided.has(def.optionKey));
    if (missing.length > 0) {
      const name = featNameBySlug[feat.featSlug] ?? feat.featSlug;
      return `Complete todas as escolhas do talento ${name}.`;
    }
  }

  const validKeys = new Set(
    characterFeats.map((feat) =>
      featInstanceKey(feat.featSlug, feat.instanceIndex),
    ),
  );
  const orphan = featOptions.some(
    (option) =>
      !validKeys.has(featInstanceKey(option.featSlug, option.instanceIndex)),
  );
  if (orphan) {
    return "Há opções de talento inválidas — revise as escolhas.";
  }

  return null;
}
