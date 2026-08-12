import { describe, expect, it } from "vitest";

import {
  coverageBaseCatalogOptionParts,
  coverageInventoryHostOptionParts,
} from "@/features/character/character-sheet/lib/inventory/coverage-base-option-label";

describe("coverage-base-option-label", () => {
  it("adds armor ac hint to catalog option", () => {
    expect(
      coverageBaseCatalogOptionParts(
        {
          slug: "half-plate",
          name: "Meia-Placa",
          itemType: "armor",
          costText: "750 PO",
          properties: null,
        },
        {
          armor: {
            slug: "half-plate",
            name: "Meia-Placa",
            categorySlug: "medium",
            categoryName: "Armadura Média",
            donDoff: null,
            acBase: 15,
            acFormula: "15 + Modificador de Des (máx. 2)",
            strengthReq: null,
            stealthDisadvantage: true,
            costText: "750 PO",
            weight: "20 kg",
          },
        },
      ),
    ).toEqual({
      label: "Meia-Placa · 750 PO",
      hint: "Armadura Média · CA 15 + Modificador de Des (máx. 2) · Desv. furtividade",
    });
  });

  it("adds shield hint and cost fallback from armor catalog", () => {
    expect(
      coverageBaseCatalogOptionParts(
        {
          slug: "shield",
          name: "Escudo",
          itemType: "armor",
          costText: null,
          properties: null,
        },
        {
          armor: {
            slug: "shield",
            name: "Escudo",
            categorySlug: "shield",
            categoryName: "Escudo",
            donDoff: null,
            acBase: null,
            acFormula: "+2",
            strengthReq: null,
            stealthDisadvantage: false,
            costText: "10 PO",
            weight: "3 kg",
          },
        },
      ),
    ).toEqual({
      label: "Escudo · 10 PO",
      hint: "Escudo · Bônus CA +2",
    });
  });

  it("adds weapon damage and properties to catalog option", () => {
    expect(
      coverageBaseCatalogOptionParts(
        {
          slug: "shortbow",
          name: "Arco Curto",
          itemType: "weapon",
          costText: "25 PO",
          properties: null,
        },
        {
          weapon: {
            slug: "shortbow",
            name: "Arco Curto",
            category: "simple",
            damage: "1d6",
            damageType: "Perfurante",
            versatileDamage: null,
            cost: { text: "25 PO" },
            weight: "1 kg",
            range: { normal: 24, max: 96 },
            propertyDetails: [
              { slug: "two-handed", name: "Duas Mãos", description: "" },
              { slug: "ammunition", name: "Munição", description: "" },
            ],
            mastery: { slug: "vex", name: "Atormentar", description: "" },
          },
        },
      ),
    ).toEqual({
      label: "Arco Curto · 25 PO",
      hint: "Dano 1d6 · Perfurante · Duas Mãos, Munição · Maestria Atormentar · Alcance 24/96 m",
    });
  });

  it("adds hint for inventory host", () => {
    expect(
      coverageInventoryHostOptionParts(
        {
          itemSlug: "chain-mail",
          itemName: "Cota de Malha",
          itemType: "armor",
          quantity: 1,
          location: "backpack",
          equipmentSlot: null,
          attuned: false,
          effectsActive: false,
          effectsStatus: "inactive_unequipped",
          requiresAttunement: false,
          weightKg: 27,
        },
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
    ).toEqual({
      label: "Cota de Malha",
      hint: "Armadura Pesada · CA 16 · For 13+ · Desv. furtividade",
    });
  });
});
