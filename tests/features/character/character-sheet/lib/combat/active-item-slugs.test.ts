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
});
