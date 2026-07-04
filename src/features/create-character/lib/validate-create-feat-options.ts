import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import { featInstanceKey } from "@/entities/character/lib/character-feat";
import { fetchFeatOptions } from "@/features/feat-catalog/api/feats.api";

export async function findIncompleteCreateFeatOptions(
  characterFeats: CharacterFeat[],
  featOptions: FeatOption[],
  featNameBySlug: Record<string, string> = {},
): Promise<string | null> {
  for (const feat of characterFeats) {
    const response = await fetchFeatOptions(feat.featSlug);
    const defs = response.data ?? [];
    if (defs.length === 0) continue;

    const provided = new Set(
      featOptions
        .filter(
          (option) =>
            option.featSlug === feat.featSlug &&
            option.instanceIndex === feat.instanceIndex,
        )
        .map((option) => option.optionKey),
    );

    const missing = defs.filter((def) => !provided.has(def.optionKey));
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
