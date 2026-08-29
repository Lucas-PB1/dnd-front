import { describe, expect, it } from "vitest";

import {
  isBardingItem,
  parseBardingBaseArmorSlug,
  resolveShopArmor,
} from "@/features/catalog/item-catalog/lib/barding";
import type { ArmorSummary } from "@/entities/armor/types";

const chainMailArmor: ArmorSummary = {
  slug: "chain-mail",
  name: "Cota de Malha",
  categorySlug: "heavy",
  categoryName: "Armadura Pesada",
  donDoff: null,
  acBase: 16,
  acFormula: "16",
  strengthReq: 13,
  stealthDisadvantage: true,
  costText: "75 PO",
  weight: "27 kg",
};

describe("barding catalog", () => {
  it("detects barding and parses base armor slug", () => {
    const item = {
      slug: "barding-chain-mail",
      itemType: "other",
      kind: "barding",
      properties: { kind: "barding", baseArmorSlug: "chain-mail" },
    };
    expect(isBardingItem(item)).toBe(true);
    expect(parseBardingBaseArmorSlug(item)).toBe("chain-mail");
  });

  it("resolves armor stats from base slug in shop index", () => {
    const armorBySlug = new Map([["chain-mail", chainMailArmor]]);
    const resolved = resolveShopArmor(
      {
        slug: "barding-chain-mail",
        itemType: "other",
        kind: "barding",
        properties: { kind: "barding", baseArmorSlug: "chain-mail" },
      },
      armorBySlug,
    );
    expect(resolved?.acFormula).toBe("16");
    expect(resolved?.categoryName).toBe("Armadura Pesada");
  });
});
