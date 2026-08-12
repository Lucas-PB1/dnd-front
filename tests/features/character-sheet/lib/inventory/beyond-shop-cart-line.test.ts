import { describe, expect, it } from "vitest";

import {
  formatShopBundleLabel,
  formatShopLineCost,
} from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";
import {
  coverageTierBonusCostGp,
  resolveCoverageShopCostText,
} from "@/features/character/character-sheet/lib/inventory/coverage-tier-cost";

describe("coverage-tier-cost", () => {
  it("prices armor and weapon tiers by DMG rarity", () => {
    expect(coverageTierBonusCostGp("armor", 1)).toBe(4_000);
    expect(coverageTierBonusCostGp("armor", 2)).toBe(40_000);
    expect(coverageTierBonusCostGp("armor", 3)).toBe(200_000);
    expect(coverageTierBonusCostGp("weapon", 1)).toBe(400);
    expect(coverageTierBonusCostGp("shield", 3)).toBe(40_000);
  });

  it("resolves shop cost text from coverage + bonus", () => {
    expect(
      resolveCoverageShopCostText(
        {
          kind: "coverage",
          costText: null,
          properties: {
            kind: "coverage",
            appliesTo: "armor",
            appliesFilter: "x",
            requiresTierBonus: true,
          },
        },
        1,
      ),
    ).toBe("4.000 PO");
  });
});

describe("beyond-shop-cart-line tier pricing", () => {
  it("formats half-plate +1/+2/+3 with base + rarity value", () => {
    const base = {
      slug: "half-plate",
      name: "Meia-Placa",
      costText: "750 PO",
    };
    const coverage = {
      slug: "armadura-1-2-ou-3",
      name: "Armadura, +1, +2 ou +3",
      costText: null,
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "armor",
        appliesFilter: "Qualquer Leve, Média ou Pesada",
        requiresTierBonus: true,
      },
    };

    expect(formatShopBundleLabel(base as never, coverage as never, 1)).toBe(
      "Meia-Placa +1",
    );
    expect(
      formatShopLineCost({
        item: base,
        quantity: 1,
        attachCoverageSlug: coverage.slug,
        attachCoverageBonus: 1,
        coverageItem: coverage,
      } as never),
    ).toBe("750 PO + 4.000 PO");
    expect(
      formatShopLineCost({
        item: base,
        quantity: 1,
        attachCoverageSlug: coverage.slug,
        attachCoverageBonus: 2,
        coverageItem: coverage,
      } as never),
    ).toBe("750 PO + 40.000 PO");
    expect(
      formatShopLineCost({
        item: base,
        quantity: 1,
        attachCoverageSlug: coverage.slug,
        attachCoverageBonus: 3,
        coverageItem: coverage,
      } as never),
    ).toBe("750 PO + 200.000 PO");
  });
});
