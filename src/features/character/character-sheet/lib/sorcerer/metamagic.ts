import type { ClassOption } from "@/entities/character/sheet-types";

export const METAMAGIC_OPTION_KEY = "metamagic";

/** L2: 2 · L10: 4 · L17: 6 */
export function sorcererMetamagicLimit(level: number): number {
  if (level >= 17) return 6;
  if (level >= 10) return 4;
  if (level >= 2) return 2;
  return 0;
}

export function readMetamagicSlugs(
  classOptions: readonly ClassOption[] | null | undefined,
): string[] {
  return (classOptions ?? [])
    .filter((option) => option.optionKey === METAMAGIC_OPTION_KEY)
    .sort((a, b) => (a.instanceIndex ?? 0) - (b.instanceIndex ?? 0))
    .map((option) => option.valueId);
}

export function mergeMetamagicIntoClassOptions(
  classOptions: readonly ClassOption[],
  slugs: readonly string[],
): ClassOption[] {
  const kept = classOptions.filter(
    (option) => option.optionKey !== METAMAGIC_OPTION_KEY,
  );
  return [
    ...kept,
    ...slugs.map((slug, index) => ({
      optionKey: METAMAGIC_OPTION_KEY,
      valueId: slug,
      instanceIndex: index,
    })),
  ];
}
