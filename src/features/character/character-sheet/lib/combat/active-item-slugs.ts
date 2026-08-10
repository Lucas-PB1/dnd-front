/** Slugs de itens mágicos ativos na Economia (espelha itemEffectsActive + charms + coberturas + consumíveis). */

export type ActiveItemInventoryLike = {
  itemSlug: string;
  effectsActive: boolean;
  location?: "equipped" | "backpack";
  attachedCharmSlug?: string | null;
  attachedCoverageSlug?: string | null;
  /**
   * false = cobertura exige sintonia e ainda não sintonizou.
   * true/undefined = ativa (API ou cobertura sem sintonia).
   */
  attachedCoverageAttuned?: boolean;
  /** Poção / óleo / pergaminho: ativo na Economia com quantity > 0 (mesmo na mochila). */
  consumable?: boolean;
  quantity?: number;
};

export type ActiveItemWeaponLike = {
  attachedCharmSlug?: string | null;
  attachedCoverageSlug?: string | null;
};

export function collectActiveItemSlugs(input: {
  inventoryItems?: readonly ActiveItemInventoryLike[];
  weaponAttacks?: readonly ActiveItemWeaponLike[];
}): string[] {
  const slugs = new Set<string>();

  for (const item of input.inventoryItems ?? []) {
    if (item.effectsActive) slugs.add(item.itemSlug);
    if (
      item.consumable &&
      (item.quantity == null || item.quantity > 0)
    ) {
      slugs.add(item.itemSlug);
    }
    if (item.location === "equipped" && item.attachedCharmSlug) {
      slugs.add(item.attachedCharmSlug);
    }
    if (
      item.location === "equipped" &&
      item.attachedCoverageSlug &&
      item.attachedCoverageAttuned !== false
    ) {
      slugs.add(item.attachedCoverageSlug);
    }
  }

  for (const attack of input.weaponAttacks ?? []) {
    if (attack.attachedCharmSlug) slugs.add(attack.attachedCharmSlug);
    if (attack.attachedCoverageSlug) slugs.add(attack.attachedCoverageSlug);
  }

  return [...slugs].sort();
}
