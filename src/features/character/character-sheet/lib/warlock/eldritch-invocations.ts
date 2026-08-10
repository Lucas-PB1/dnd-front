import type { ClassOption } from "@/entities/character/sheet-types";

export const ELDRITCH_INVOCATION_OPTION_KEY = "eldritch-invocation";
export const ELDRITCH_INVOCATION_CANTRIP_OPTION_KEY =
  "eldritch-invocation-cantrip";
export const ELDRITCH_INVOCATION_ORIGIN_FEAT_OPTION_KEY =
  "eldritch-invocation-origin-feat";

export const LESSONS_OF_THE_FIRST_ONES_SLUG = "lessons-of-the-first-ones";

export const BLAST_INVOCATION_SLUGS = [
  "agonizing-blast",
  "repelling-blast",
  "eldritch-spear",
] as const;

export type BlastInvocationSlug = (typeof BLAST_INVOCATION_SLUGS)[number];

export function isBlastInvocationSlug(
  slug: string,
): slug is BlastInvocationSlug {
  return (BLAST_INVOCATION_SLUGS as readonly string[]).includes(slug);
}

export function isLessonsOfTheFirstOnesSlug(slug: string): boolean {
  return slug === LESSONS_OF_THE_FIRST_ONES_SLUG;
}

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

export type EldritchInvocationPick = {
  slug: string;
  cantripSlug?: string | null;
  originFeatSlug?: string | null;
};

export function readEldritchInvocationSlugs(
  classOptions: readonly ClassOption[] | null | undefined,
): string[] {
  return readEldritchInvocationPicks(classOptions).map((pick) => pick.slug);
}

export function readEldritchInvocationPicks(
  classOptions: readonly ClassOption[] | null | undefined,
): EldritchInvocationPick[] {
  const cantripByIndex = new Map<number, string>();
  const originFeatByIndex = new Map<number, string>();
  for (const option of classOptions ?? []) {
    const index = option.instanceIndex ?? 0;
    if (option.optionKey === ELDRITCH_INVOCATION_CANTRIP_OPTION_KEY) {
      cantripByIndex.set(index, option.valueId);
    }
    if (option.optionKey === ELDRITCH_INVOCATION_ORIGIN_FEAT_OPTION_KEY) {
      originFeatByIndex.set(index, option.valueId);
    }
  }
  return (classOptions ?? [])
    .filter((option) => option.optionKey === ELDRITCH_INVOCATION_OPTION_KEY)
    .sort((a, b) => (a.instanceIndex ?? 0) - (b.instanceIndex ?? 0))
    .map((option) => {
      const index = option.instanceIndex ?? 0;
      return {
        slug: option.valueId,
        cantripSlug: isBlastInvocationSlug(option.valueId)
          ? (cantripByIndex.get(index) ?? null)
          : null,
        originFeatSlug: isLessonsOfTheFirstOnesSlug(option.valueId)
          ? (originFeatByIndex.get(index) ?? null)
          : null,
      };
    });
}

export function mergeEldritchInvocationsIntoClassOptions(
  classOptions: readonly ClassOption[],
  picks: readonly EldritchInvocationPick[],
): ClassOption[] {
  const kept = classOptions.filter(
    (option) =>
      option.optionKey !== ELDRITCH_INVOCATION_OPTION_KEY &&
      option.optionKey !== ELDRITCH_INVOCATION_CANTRIP_OPTION_KEY &&
      option.optionKey !== ELDRITCH_INVOCATION_ORIGIN_FEAT_OPTION_KEY,
  );
  const next: ClassOption[] = [...kept];
  picks.forEach((pick, index) => {
    next.push({
      optionKey: ELDRITCH_INVOCATION_OPTION_KEY,
      valueId: pick.slug,
      instanceIndex: index,
    });
    if (isBlastInvocationSlug(pick.slug) && pick.cantripSlug) {
      next.push({
        optionKey: ELDRITCH_INVOCATION_CANTRIP_OPTION_KEY,
        valueId: pick.cantripSlug,
        instanceIndex: index,
      });
    }
    if (isLessonsOfTheFirstOnesSlug(pick.slug) && pick.originFeatSlug) {
      next.push({
        optionKey: ELDRITCH_INVOCATION_ORIGIN_FEAT_OPTION_KEY,
        valueId: pick.originFeatSlug,
        instanceIndex: index,
      });
    }
  });
  return next;
}

const KIND_LABELS: Record<string, string> = {
  free_cast: "Conjura sem espaço",
  passive: "Passiva",
  note: "Nota de mesa",
  bonus: "Ação Bônus",
  action: "Ação",
  reaction: "Reação",
};

/** Presente das Profundezas: free cast 1×/DL. */
const ONCE_PER_LONG_REST_SLUGS = new Set(["gift-of-the-depths"]);

export function isEldritchOncePerLongRestInvocation(slug: string): boolean {
  return ONCE_PER_LONG_REST_SLUGS.has(slug);
}

export function eldritchInvocationKindLabel(
  kind: string,
  slug?: string,
): string {
  if (kind === "free_cast" && slug && isEldritchOncePerLongRestInvocation(slug)) {
    return "1× por Descanso Longo";
  }
  if (slug && isLessonsOfTheFirstOnesSlug(slug)) {
    return "Talento de Origem";
  }
  return KIND_LABELS[kind] ?? kind;
}

export function eldritchInvocationMetaLine(input: {
  kindLabel: string;
  grantedSpellName?: string | null;
  boundCantripName?: string | null;
  boundOriginFeatName?: string | null;
}): string {
  const parts = [input.kindLabel];
  if (input.boundCantripName) parts.push(input.boundCantripName);
  if (input.boundOriginFeatName) parts.push(input.boundOriginFeatName);
  if (input.grantedSpellName) parts.push(input.grantedSpellName);
  return parts.join(" · ");
}
