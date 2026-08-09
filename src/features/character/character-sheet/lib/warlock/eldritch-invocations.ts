import type { ClassOption } from "@/entities/character/sheet-types";

export const ELDRITCH_INVOCATION_OPTION_KEY = "eldritch-invocation";

/** Contagem PHB 2024 — coluna Invocações. */
export function warlockInvocationLimit(level: number): number {
  if (level >= 18) return 10;
  if (level >= 15) return 9;
  if (level >= 12) return 8;
  if (level >= 9) return 7;
  if (level >= 7) return 6;
  if (level >= 5) return 5;
  if (level >= 2) return 3;
  if (level >= 1) return 1;
  return 0;
}

export function readEldritchInvocationSlugs(
  classOptions: readonly ClassOption[] | null | undefined,
): string[] {
  return (classOptions ?? [])
    .filter((option) => option.optionKey === ELDRITCH_INVOCATION_OPTION_KEY)
    .sort((a, b) => (a.instanceIndex ?? 0) - (b.instanceIndex ?? 0))
    .map((option) => option.valueId);
}

export function mergeEldritchInvocationsIntoClassOptions(
  classOptions: readonly ClassOption[],
  invocationSlugs: readonly string[],
): ClassOption[] {
  const kept = classOptions.filter(
    (option) => option.optionKey !== ELDRITCH_INVOCATION_OPTION_KEY,
  );
  const picks = invocationSlugs.map((slug, index) => ({
    optionKey: ELDRITCH_INVOCATION_OPTION_KEY,
    valueId: slug,
    instanceIndex: index,
  }));
  return [...kept, ...picks];
}
