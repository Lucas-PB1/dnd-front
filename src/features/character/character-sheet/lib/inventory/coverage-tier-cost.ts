import type { ItemSummary } from "@/entities/item/types";

/**
 * Valores DMG 2024 (Magic Item Rarities and Values).
 * Peça base PHB soma à parte.
 */
const RARITY_VALUE_GP = {
  uncommon: 400,
  rare: 4_000,
  "very-rare": 40_000,
  legendary: 200_000,
} as const;

type CoverageAppliesTo =
  | "weapon"
  | "armor"
  | "shield"
  | "ammunition"
  | "wand"
  | "unarmed";

const TIER_RARITY_BY_APPLIES: Record<
  CoverageAppliesTo,
  Record<1 | 2 | 3, keyof typeof RARITY_VALUE_GP>
> = {
  armor: { 1: "rare", 2: "very-rare", 3: "legendary" },
  weapon: { 1: "uncommon", 2: "rare", 3: "very-rare" },
  shield: { 1: "uncommon", 2: "rare", 3: "very-rare" },
  ammunition: { 1: "uncommon", 2: "rare", 3: "very-rare" },
  wand: { 1: "uncommon", 2: "rare", 3: "very-rare" },
  unarmed: { 1: "uncommon", 2: "rare", 3: "very-rare" },
};

function parseAppliesTo(
  item: Pick<ItemSummary, "properties" | "kind">,
): CoverageAppliesTo | null {
  const props = item.properties;
  const kind = props?.kind ?? item.kind;
  if (kind !== "coverage") return null;
  if (props?.requiresTierBonus !== true) return null;
  const appliesTo = props?.appliesTo;
  if (
    appliesTo === "weapon" ||
    appliesTo === "armor" ||
    appliesTo === "shield" ||
    appliesTo === "ammunition" ||
    appliesTo === "wand" ||
    appliesTo === "unarmed"
  ) {
    return appliesTo;
  }
  return null;
}

export function coverageTierBonusCostGp(
  appliesTo: CoverageAppliesTo,
  bonus: 1 | 2 | 3,
): number {
  return RARITY_VALUE_GP[TIER_RARITY_BY_APPLIES[appliesTo][bonus]];
}

export function coverageTierBonusCostText(
  appliesTo: CoverageAppliesTo,
  bonus: 1 | 2 | 3,
): string {
  return `${coverageTierBonusCostGp(appliesTo, bonus).toLocaleString("pt-BR")} PO`;
}

/** Preço da cobertura +1/+2/+3 quando o catálogo não tem `costText`. */
export function resolveCoverageShopCostText(
  coverage: Pick<ItemSummary, "properties" | "kind" | "costText">,
  bonus?: 1 | 2 | 3,
): string | null {
  if (coverage.costText?.trim()) return coverage.costText.trim();
  if (!bonus) return null;
  const appliesTo = parseAppliesTo(coverage);
  if (!appliesTo) return null;
  return coverageTierBonusCostText(appliesTo, bonus);
}
