import { describe, expect, it } from "vitest";

import {
  itemCatalogListQuickHint,
  itemCatalogMetaLine,
  itemCatalogShopBadges,
  itemCatalogTeaser,
} from "@/features/catalog/item-catalog/lib/item-catalog-meta";

describe("item-catalog-meta", () => {
  it("builds shop badges with magic and coverage tags", () => {
    expect(
      itemCatalogShopBadges({
        itemType: "armor",
        costText: "400 PO",
        weight: null,
        kind: "coverage",
        consumable: false,
        properties: {
          category: "Armadura (Qualquer Média ou Pesada)",
          rarityLabel: "Incomum",
          kind: "coverage",
          editionSlug: "dmg-2024-pt",
        },
      }).map((row) => row.label),
    ).toEqual(
      expect.arrayContaining(["400 PO", "Cobertura", "Incomum", "DMG"]),
    );

    expect(
      itemCatalogShopBadges({
        itemType: "weapon",
        costText: "2 PO",
        weight: "0,5 kg",
        kind: null,
        consumable: false,
        properties: { range: { normal: 6, max: 18 } },
      }).map((row) => row.label),
    ).toEqual(expect.arrayContaining(["2 PO", "0,5 kg", "Mundano"]));
  });

  it("builds quick hint for armor ac and weapon range", () => {
    expect(
      itemCatalogListQuickHint({
        itemType: "armor",
        properties: { acFormula: { type: "dex-plus-base", base: 14, dexMax: 2 } },
      }),
    ).toBe("CA 14 + Modificador de Des (máx. 2)");
    expect(
      itemCatalogListQuickHint(
        { itemType: "weapon", properties: null },
        {
          weapon: {
            slug: "dagger",
            name: "Adaga",
            category: "simple",
            damage: "1d4",
            damageType: "Perfurante",
            versatileDamage: null,
            cost: null,
            weight: null,
            range: { normal: 6, max: 18 },
            propertyDetails: [],
            mastery: null,
          },
        },
      ),
    ).toBe("Dano 1d4 · Perfurante · Alcance 6/18 m");
    expect(
      itemCatalogListQuickHint(
        { itemType: "armor", properties: null },
        {
          armor: {
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
          },
        },
      ),
    ).toBe("Armadura Pesada · CA 16 · For 13+ · Desv. furtividade");
    expect(
      itemCatalogListQuickHint({
        itemType: "armor",
        properties: {
          appliesFilter: "Qualquer Média ou Pesada, Exceto Gibão de Peles",
        },
      }),
    ).toContain("Aplica em:");
  });

  it("builds meta line with cost and coverage tag", () => {
    expect(
      itemCatalogMetaLine({
        itemType: "armor",
        costText: "400 PO",
        weight: null,
        kind: "coverage",
        consumable: false,
        properties: {
          category: "Armadura (Qualquer Média ou Pesada)",
          rarityLabel: "Incomum",
        },
      }),
    ).toContain("400 PO");
    expect(
      itemCatalogMetaLine({
        itemType: "armor",
        costText: "400 PO",
        weight: null,
        kind: "coverage",
        consumable: false,
        properties: {
          category: "Armadura (Qualquer Média ou Pesada)",
          rarityLabel: "Incomum",
        },
      }),
    ).toContain("cobertura");
  });

  it("prefers description over header for teaser", () => {
    expect(
      itemCatalogTeaser({
        description: "Texto do efeito.",
        properties: { header: "Cabeçalho" },
      }),
    ).toBe("Texto do efeito.");
    expect(
      itemCatalogTeaser({
        description: null,
        properties: { header: "Cabeçalho curto" },
      }),
    ).toBe("Cabeçalho curto");
  });
});
