import {
  resolveHeritageDisplaySpeed,
  sortHeritageTraitOptions as sortGhHeritageTraitOptionsExport,
} from "@/entities/heritage";

export {
  aggregateTraitTakes,
  buildTraditionalHeritageChoices,
  ghHeritageTraitSlotNumber,
  HERITAGE_SIZE_KIND,
  HERITAGE_SPEED_TRADE_KIND,
  HERITAGE_TRAIT_SLOT_9,
  HERITAGE_TRAIT_SLOTS,
  isGhHeritageTraitSlot,
  isGrimHollowHeritageSlug,
  isHeritageTraitSlot,
  resolveHeritageDisplaySpeed,
} from "@/entities/heritage";

/** @deprecated heranças GH não usam mais phb_species */
export const GH_HERITAGE_TRAIT_INDEX_SLUG = "gh-heritage-traits";

export const sortGhHeritageTraitOptions = sortGhHeritageTraitOptionsExport;

export function resolveGhHeritageDisplaySpeed(
  baseSpeed: string | null | undefined,
  choices: readonly { choiceKind: string; choiceSlug: string }[],
): string | null {
  return resolveHeritageDisplaySpeed(baseSpeed, choices);
}
