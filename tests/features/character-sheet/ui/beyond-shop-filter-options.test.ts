import { describe, expect, it } from "vitest";

import {
  countActiveShopAdvancedFilters,
  EMPTY_SHOP_ADVANCED_FILTERS,
  shopAdvancedFilterLabels,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-filter-options";

describe("beyond-shop-filter-options", () => {
  it("counts active advanced filters", () => {
    expect(
      countActiveShopAdvancedFilters(EMPTY_SHOP_ADVANCED_FILTERS, false),
    ).toBe(0);
    expect(
      countActiveShopAdvancedFilters(
        {
          ...EMPTY_SHOP_ADVANCED_FILTERS,
          editionSlug: "dmg-2024-pt",
          sort: "cost_desc",
          coverageOnly: true,
        },
        true,
      ),
    ).toBe(4);
  });

  it("builds removable chip labels", () => {
    const chips = shopAdvancedFilterLabels(
      {
        ...EMPTY_SHOP_ADVANCED_FILTERS,
        rarity: "rare",
        sort: "cost_asc",
      },
      false,
      "DMG 2024",
    );
    expect(chips.map((chip) => chip.label)).toEqual([
      "Raridade: Raro",
      "Preço ↑",
    ]);
  });
});
