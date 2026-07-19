export type CharacterFeat = {
  featSlug: string;
  instanceIndex: number;
};

export function featInstanceKey(
  featSlug: string,
  instanceIndex: number,
): string {
  return `${featSlug}:${instanceIndex}`;
}

export function appendCharacterFeat(
  feats: CharacterFeat[],
  featSlug: string,
): CharacterFeat[] {
  const instanceIndex = nextCharacterFeatInstanceIndex(feats, featSlug);
  return [...feats, { featSlug, instanceIndex }];
}

export function nextCharacterFeatInstanceIndex(
  feats: CharacterFeat[],
  featSlug: string,
): number {
  const indices = feats
    .filter((feat) => feat.featSlug === featSlug)
    .map((feat) => feat.instanceIndex);
  if (indices.length === 0) return 0;
  return Math.max(...indices) + 1;
}

export function formatCharacterFeatLabel(
  feat: CharacterFeat,
  nameBySlug: Record<string, string>,
  allFeats: CharacterFeat[],
): string {
  const name = nameBySlug[feat.featSlug] ?? feat.featSlug;
  const duplicates = allFeats.filter(
    (item) => item.featSlug === feat.featSlug,
  ).length;
  if (duplicates <= 1) return name;
  return `${name} (${feat.instanceIndex + 1}ª vez)`;
}

export function canAddCharacterFeat(
  feats: CharacterFeat[],
  featSlug: string,
  repeatable: boolean,
): boolean {
  if (repeatable) return true;
  return !feats.some((feat) => feat.featSlug === featSlug);
}
