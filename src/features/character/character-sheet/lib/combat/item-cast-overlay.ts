/** Overlay Treasure pré-cast (CD / componentes / concentração) na aba Ações. */

export const ENSPELLED_ECONOMY_ITEM_SLUGS = new Set([
  "arma-magificada",
  "armadura-magificada",
  "cajado-magificado",
]);

const ENSPELLED_STATS_BY_LEVEL: Readonly<
  Record<number, { saveDc: number; spellAttackBonus: number }>
> = {
  0: { saveDc: 13, spellAttackBonus: 5 },
  1: { saveDc: 13, spellAttackBonus: 5 },
  2: { saveDc: 13, spellAttackBonus: 5 },
  3: { saveDc: 15, spellAttackBonus: 7 },
  4: { saveDc: 15, spellAttackBonus: 7 },
  5: { saveDc: 17, spellAttackBonus: 9 },
  6: { saveDc: 17, spellAttackBonus: 9 },
  7: { saveDc: 18, spellAttackBonus: 10 },
  8: { saveDc: 18, spellAttackBonus: 10 },
};

export type ItemCastInventoryLike = {
  itemSlug: string;
  location?: "equipped" | "backpack";
  spellSaveDc?: number | null;
  spellAttackBonus?: number | null;
  requiresComponents?: boolean;
  useCasterAbility?: boolean;
  attachedCoverageSlug?: string | null;
  boundSpellSlug?: string | null;
};

export type ItemCastOverlaySnapshot = {
  saveDc: number | null;
  attackBonus: number | null;
  /** True quando o cast do item não exige V/S/M além do próprio item. */
  noComponents: boolean;
  requiresConcentration: boolean;
  useCasterAbility: boolean;
};

export function isItemSpellCastAction(action: {
  itemSlug?: string | null;
  spellSlug?: string | null;
}): boolean {
  return Boolean(action.itemSlug?.trim() && action.spellSlug?.trim());
}

export function findInventoryItemForCast(
  items: readonly ItemCastInventoryLike[] | undefined,
  itemSlug: string,
): ItemCastInventoryLike | undefined {
  const slug = itemSlug.trim();
  if (!slug || !items?.length) return undefined;
  const direct = items.find((item) => item.itemSlug === slug);
  if (direct) return direct;
  return items.find(
    (item) =>
      item.location === "equipped" && item.attachedCoverageSlug === slug,
  );
}

function enspelledStatsForLevel(
  spellLevel: number | null | undefined,
): { saveDc: number; spellAttackBonus: number } | null {
  if (spellLevel == null || !Number.isFinite(spellLevel)) return null;
  return ENSPELLED_STATS_BY_LEVEL[spellLevel] ?? null;
}

/**
 * Monta snapshot visual do cast de item a partir do inventário (+ magia).
 * Preferência: CD/ataque do inventário; Enspelled sem CD usa tabela por nível.
 */
export function buildItemCastOverlay(input: {
  itemSlug: string;
  inventoryItems?: readonly ItemCastInventoryLike[];
  spellSlug?: string | null;
  /** Nível da magia (para fallback Enspelled). */
  spellLevel?: number | null;
  requiresConcentration?: boolean;
}): ItemCastOverlaySnapshot | null {
  const itemSlug = input.itemSlug.trim();
  if (!itemSlug) return null;

  const item = findInventoryItemForCast(input.inventoryItems, itemSlug);
  const requiresComponents = item?.requiresComponents === true;
  const useCasterAbility = item?.useCasterAbility === true;

  let saveDc =
    item?.spellSaveDc != null && Number.isFinite(item.spellSaveDc)
      ? item.spellSaveDc
      : null;
  let attackBonus =
    item?.spellAttackBonus != null && Number.isFinite(item.spellAttackBonus)
      ? item.spellAttackBonus
      : null;

  if (
    (saveDc == null || attackBonus == null) &&
    ENSPELLED_ECONOMY_ITEM_SLUGS.has(itemSlug)
  ) {
    const enspelled = enspelledStatsForLevel(input.spellLevel);
    if (enspelled) {
      saveDc ??= enspelled.saveDc;
      attackBonus ??= enspelled.spellAttackBonus;
    }
  }

  return {
    saveDc,
    attackBonus,
    noComponents: !requiresComponents,
    requiresConcentration: input.requiresConcentration === true,
    useCasterAbility,
  };
}

/** Chips curtos para a linha Conjurar de item. */
export function itemCastOverlayChipLabels(
  overlay: ItemCastOverlaySnapshot,
): string[] {
  const chips: string[] = [];
  if (overlay.saveDc != null) chips.push(`CD ${overlay.saveDc}`);
  if (overlay.noComponents) chips.push("Sem componentes");
  if (overlay.requiresConcentration) chips.push("Concentração");
  if (overlay.useCasterAbility) chips.push("Atributo do conjurador");
  return chips;
}

export function shouldConfirmConcentrationSwap(input: {
  concentratingOn: string | null | undefined;
  spellSlug: string | null | undefined;
  requiresConcentration: boolean;
}): boolean {
  const current = input.concentratingOn?.trim() || null;
  const next = input.spellSlug?.trim() || null;
  if (!input.requiresConcentration || !current || !next) return false;
  return current !== next;
}
