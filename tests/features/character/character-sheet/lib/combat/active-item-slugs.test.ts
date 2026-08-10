import { describe, expect, it } from "vitest";

import { collectActiveItemSlugs } from "@/features/character/character-sheet/lib/combat/active-item-slugs";

describe("collectActiveItemSlugs", () => {
  it("keeps only effectsActive inventory items", () => {
    const slugs = collectActiveItemSlugs({
      inventoryItems: [
        {
          itemSlug: "ring-of-barrels",
          effectsActive: true,
          location: "equipped",
        },
        {
          itemSlug: "gambler-s-coin",
          effectsActive: false,
          location: "equipped",
        },
        {
          itemSlug: "bag-of-cheer",
          effectsActive: false,
          location: "backpack",
        },
      ],
    });
    expect(slugs).toEqual(["ring-of-barrels"]);
  });

  it("includes charms attached to equipped weapons", () => {
    const slugs = collectActiveItemSlugs({
      inventoryItems: [
        {
          itemSlug: "longsword",
          effectsActive: true,
          location: "equipped",
          attachedCharmSlug: "weapon-charm-hook",
        },
      ],
      weaponAttacks: [{ attachedCharmSlug: "weapon-charm-lightning" }],
    });
    expect(slugs).toEqual([
      "longsword",
      "weapon-charm-hook",
      "weapon-charm-lightning",
    ]);
  });

  it("includes coverages attached to equipped pieces when attuned", () => {
    const slugs = collectActiveItemSlugs({
      inventoryItems: [
        {
          itemSlug: "longsword",
          effectsActive: true,
          location: "equipped",
          attachedCoverageSlug: "arma-1-2-ou-3",
          attachedCoverageAttuned: true,
        },
        {
          itemSlug: "shield",
          effectsActive: true,
          location: "equipped",
          attachedCoverageSlug: "escudo-1-2-ou-3",
          attachedCoverageAttuned: false,
        },
      ],
      weaponAttacks: [{ attachedCoverageSlug: "arma-vorpal" }],
    });
    expect(slugs).toEqual(["arma-1-2-ou-3", "arma-vorpal", "longsword", "shield"]);
  });

  it("includes backpack consumables with quantity", () => {
    const slugs = collectActiveItemSlugs({
      inventoryItems: [
        {
          itemSlug: "pocao-de-cura",
          effectsActive: false,
          location: "backpack",
          consumable: true,
          quantity: 2,
        },
        {
          itemSlug: "pocao-de-voo",
          effectsActive: false,
          location: "backpack",
          consumable: true,
          quantity: 0,
        },
      ],
    });
    expect(slugs).toEqual(["pocao-de-cura"]);
  });
});
