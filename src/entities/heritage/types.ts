export type HeritageCategory = "common" | "rare" | "eldritch";

export interface HeritageSummary {
  slug: string;
  name: string;
  editionSlug: string | null;
  category?: HeritageCategory;
  tagline?: string | null;
  summary?: string | null;
  creatureType?: string;
  sizeRule?: string;
  speedRule?: string;
  description?: string;
  imageUrl?: string | null;
}

/** Item completo da listagem do compêndio (GET /heritages sem fields=summary). */
export type HeritageCompendiumItem = HeritageDetail;

export interface HeritageDetail extends HeritageSummary {
  category: HeritageCategory;
  tagline: string | null;
  summary: string | null;
  creatureType: string;
  sizeRule: string;
  speedRule: string;
  description: string;
  allowsSpeedTrade: boolean;
  allowsSizeChoice: boolean;
  imageUrl: string | null;
}

export interface HeritageModularTrait {
  slug: string;
  name: string;
  category: string;
  description: string;
  benefitBase: string | null;
  benefitImproved: string | null;
}

export interface HeritageTraitChoice {
  choiceKind: string;
  traitSlug: string;
  traitName: string;
  label: string;
  benefitBase: string | null;
  benefitImproved: string | null;
  isTraditional: boolean;
  sortOrder: number;
}

export interface HeritageTraditionalTrait {
  traitSlug: string;
  traitName: string;
  category: string;
  categoryHint: string;
  sortOrder: number;
}

export interface AggregatedHeritageTrait {
  traitSlug: string;
  takeCount: number;
  slotIndexes: number[];
  activeBenefits: string[];
}

export interface HeritageTraitPick {
  choiceKind: string;
  choiceSlug: string;
}

export const HERITAGE_TRAIT_SLOT_PREFIX = "heritage_trait_";

export const HERITAGE_TRAIT_SLOTS = [
  "heritage_trait_1",
  "heritage_trait_2",
  "heritage_trait_3",
  "heritage_trait_4",
  "heritage_trait_5",
  "heritage_trait_6",
  "heritage_trait_7",
  "heritage_trait_8",
] as const;

export const HERITAGE_TRAIT_SLOT_9 = "heritage_trait_9";
export const HERITAGE_SPEED_TRADE_KIND = "heritage_speed_trade";
export const HERITAGE_SIZE_KIND = "heritage_size";

export function isHeritageTraitSlot(choiceKind: string): boolean {
  return choiceKind.startsWith(HERITAGE_TRAIT_SLOT_PREFIX);
}

export function heritageTraitSlotIndex(choiceKind: string): number | null {
  const match = choiceKind.match(/^heritage_trait_(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function aggregateTraitTakes(
  picks: readonly HeritageTraitPick[],
): AggregatedHeritageTrait[] {
  const bySlug = new Map<
    string,
    { traitSlug: string; takeCount: number; slotIndexes: number[] }
  >();

  for (const pick of picks) {
    if (!isHeritageTraitSlot(pick.choiceKind)) continue;
    const slotIndex = heritageTraitSlotIndex(pick.choiceKind);
    const traitSlug = pick.choiceSlug?.trim();
    if (!traitSlug || slotIndex === null) continue;

    const existing = bySlug.get(traitSlug);
    if (existing) {
      existing.takeCount += 1;
      existing.slotIndexes.push(slotIndex);
      continue;
    }
    bySlug.set(traitSlug, {
      traitSlug,
      takeCount: 1,
      slotIndexes: [slotIndex],
    });
  }

  return [...bySlug.values()]
    .sort((left, right) => left.traitSlug.localeCompare(right.traitSlug))
    .map((entry) => ({
      ...entry,
      activeBenefits: [],
    }));
}

export function resolveHeritageDisplaySpeed(
  baseSpeed: string | null | undefined,
  heritageChoices: readonly HeritageTraitPick[],
): string | null {
  if (!baseSpeed?.trim()) return baseSpeed ?? null;
  const trade = heritageChoices.find(
    (choice) => choice.choiceKind === HERITAGE_SPEED_TRADE_KIND,
  );
  if (trade?.choiceSlug !== "yes") return baseSpeed;

  const match = baseSpeed.match(/([\d,]+)\s*m/i);
  if (!match) {
    return `${baseSpeed} (−1,5 m por troca de traço)`;
  }
  const meters = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(meters)) return baseSpeed;
  const adjusted = Math.max(0, meters - 1.5);
  const formatted = Number.isInteger(adjusted)
    ? String(adjusted)
    : adjusted.toFixed(1).replace(".", ",");
  return `${formatted} m`;
}

export function buildTraditionalHeritageChoices(
  traditional: readonly HeritageTraditionalTrait[],
  options: {
    allowsSpeedTrade: boolean;
    allowsSizeChoice: boolean;
    speedTrade?: "yes" | "no";
    sizeChoice?: "small" | "medium";
  },
): HeritageTraitPick[] {
  const sorted = [...traditional].sort((a, b) => a.sortOrder - b.sortOrder);
  const picks: HeritageTraitPick[] = sorted.slice(0, 8).map((trait, index) => ({
    choiceKind: `heritage_trait_${index + 1}`,
    choiceSlug: trait.traitSlug,
  }));

  if (options.allowsSpeedTrade) {
    picks.push({
      choiceKind: HERITAGE_SPEED_TRADE_KIND,
      choiceSlug: options.speedTrade ?? "no",
    });
  }
  if (options.allowsSizeChoice) {
    picks.push({
      choiceKind: HERITAGE_SIZE_KIND,
      choiceSlug: options.sizeChoice ?? "medium",
    });
  }
  return picks;
}

/** @deprecated use heritageSlug */
export function isGrimHollowHeritageSlug(
  slug: string | null | undefined,
): boolean {
  return Boolean(slug?.trim().startsWith("gh-"));
}

export function isGhHeritageTraitSlot(choiceKind: string): boolean {
  return (
    isHeritageTraitSlot(choiceKind) ||
    choiceKind.startsWith("gh_heritage_trait_")
  );
}

export function ghHeritageTraitSlotNumber(choiceKind: string): number | null {
  return (
    heritageTraitSlotIndex(choiceKind) ??
    (choiceKind.match(/^gh_heritage_trait_(\d+)$/)
      ? Number.parseInt(choiceKind.match(/^gh_heritage_trait_(\d+)$/)![1], 10)
      : null)
  );
}

const GH_TRAIT_CATEGORY_ORDER: Record<string, number> = {
  Combate: 0,
  Exploração: 1,
  Interpretação: 2,
};

export function sortHeritageTraitOptions<
  T extends { label?: string; choiceName?: string },
>(options: readonly T[]): T[] {
  return [...options].sort((left, right) => {
    const leftLabel = left.label ?? left.choiceName ?? "";
    const rightLabel = right.label ?? right.choiceName ?? "";
    const leftCat = leftLabel.match(/^\[([^\]]+)\]/);
    const rightCat = rightLabel.match(/^\[([^\]]+)\]/);
    const leftOrder =
      GH_TRAIT_CATEGORY_ORDER[leftCat?.[1] ?? ""] ?? Number.MAX_SAFE_INTEGER;
    const rightOrder =
      GH_TRAIT_CATEGORY_ORDER[rightCat?.[1] ?? ""] ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return leftLabel.localeCompare(rightLabel, "pt");
  });
}
