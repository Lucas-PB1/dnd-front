import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import { syncLinkedCastingAbilityOption } from "@/features/feat-catalog/lib/linked-casting-feats";

export function upsertOption(
  current: FeatOption[],
  feat: CharacterFeat,
  optionKey: string,
  valueId: string,
): FeatOption[] {
  const next = current.filter(
    (option) =>
      !(
        option.featSlug === feat.featSlug &&
        option.instanceIndex === feat.instanceIndex &&
        option.optionKey === optionKey
      ),
  );
  if (valueId) {
    next.push({
      featSlug: feat.featSlug,
      instanceIndex: feat.instanceIndex,
      optionKey,
      valueId,
    });
  }
  return next;
}

export function applyFeatOptionChange(
  current: FeatOption[],
  feat: CharacterFeat,
  optionKey: string,
  valueId: string,
): FeatOption[] {
  let next = upsertOption(current, feat, optionKey, valueId);
  const synced = syncLinkedCastingAbilityOption(
    feat.featSlug,
    optionKey,
    valueId,
    next,
    feat,
  );
  if (synced) {
    next = synced;
  }
  if (
    feat.featSlug === "ability-score-improvement" &&
    optionKey === "distributionMode" &&
    valueId === "plus2"
  ) {
    next = next.filter(
      (option) =>
        !(
          option.featSlug === feat.featSlug &&
          option.instanceIndex === feat.instanceIndex &&
          option.optionKey === "secondaryAbility"
        ),
    );
  }
  return next;
}
