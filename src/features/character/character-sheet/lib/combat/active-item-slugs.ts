/** Slugs de itens mágicos ativos na Economia (espelha itemEffectsActive + charms). */

export type ActiveItemInventoryLike = {
  itemSlug: string;
  effectsActive: boolean;
  location?: "equipped" | "backpack";
  attachedCharmSlug?: string | null;
};

export type ActiveItemWeaponLike = {
  attachedCharmSlug?: string | null;
};

export function collectActiveItemSlugs(input: {
  inventoryItems?: readonly ActiveItemInventoryLike[];
  weaponAttacks?: readonly ActiveItemWeaponLike[];
}): string[] {
  const slugs = new Set<string>();

  for (const item of input.inventoryItems ?? []) {
    if (item.effectsActive) slugs.add(item.itemSlug);
    if (item.location === "equipped" && item.attachedCharmSlug) {
      slugs.add(item.attachedCharmSlug);
    }
  }

  for (const attack of input.weaponAttacks ?? []) {
    if (attack.attachedCharmSlug) slugs.add(attack.attachedCharmSlug);
  }

  return [...slugs].sort();
}
