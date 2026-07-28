import {
  featInstanceKey,
} from "@/entities/character/lib/character-feat";
import type { FeatOption } from "@/entities/character/sheet-types";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";

export function pruneFeatOptions(
  previewFeats: ReturnType<typeof resolveCreateCharacterFeats>,
  featOptions: FeatOption[],
): FeatOption[] {
  const validKeys = new Set(
    previewFeats.map((feat) =>
      featInstanceKey(feat.featSlug, feat.instanceIndex),
    ),
  );
  return featOptions.filter((option) =>
    validKeys.has(featInstanceKey(option.featSlug, option.instanceIndex)),
  );
}

export function asiSlotGridClassName(count: number) {
  if (count <= 1) return "grid gap-4";
  if (count === 2) return "grid gap-4 sm:grid-cols-2";
  return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
}
