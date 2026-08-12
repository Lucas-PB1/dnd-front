import { describe, expect, it } from "vitest";

import {
  armorEquipmentStats,
  armorListQuickHint,
  weaponEquipmentStats,
  weaponListQuickHint,
  weaponTraitLines,
} from "@/features/catalog/item-catalog/lib/item-catalog-equipment-stats";

describe("item-catalog-equipment-stats", () => {
  it("maps weapon damage and properties", () => {
    const stats = weaponEquipmentStats({
      slug: "dagger",
      name: "Adaga",
      category: "simple",
      damage: "1d4",
      damageType: "Perfurante",
      versatileDamage: null,
      cost: { text: "2 PO" },
      weight: "0,5 kg",
      range: { normal: 6, max: 18 },
      propertyDetails: [
        {
          slug: "light",
          name: "Leve",
          description: "Arma leve.",
        },
        {
          slug: "finesse",
          name: "Acuidade",
          description: "Usa Destreza.",
        },
      ],
      mastery: {
        slug: "nick",
        name: "Talho",
        description: "Maestria de corte.",
      },
    });

    expect(stats.find((row) => row.label === "Dano")?.value).toContain("1d4");
    expect(stats.find((row) => row.label === "Propriedades")?.value).toContain(
      "Leve",
    );
    expect(stats.find((row) => row.label === "Maestria")?.value).toBe("Talho");
    expect(weaponTraitLines({
      slug: "dagger",
      name: "Adaga",
      category: "simple",
      damage: "1d4",
      damageType: "Perfurante",
      versatileDamage: null,
      cost: null,
      weight: null,
      range: null,
      propertyDetails: [
        { slug: "light", name: "Leve", description: "Arma leve." },
      ],
      mastery: null,
    })).toHaveLength(1);
  });

  it("maps armor ac and stealth", () => {
    const stats = armorEquipmentStats({
      slug: "chain-mail",
      name: "Cota de Malha",
      categorySlug: "heavy",
      categoryName: "Armadura Pesada",
      donDoff: "5 min",
      acBase: 16,
      acFormula: "16",
      strengthReq: 13,
      stealthDisadvantage: true,
      costText: "75 PO",
      weight: "27 kg",
    });

    expect(stats.find((row) => row.label === "CA")?.value).toBe("16");
    expect(stats.find((row) => row.label === "Furtividade")?.value).toBe(
      "Desvantagem",
    );
  });

  it("builds compact list hints", () => {
    expect(
      weaponListQuickHint({
        damage: "1d4",
        damageType: "Perfurante",
        versatileDamage: null,
        range: { normal: 6, max: 18 },
        propertyDetails: [
          { slug: "light", name: "Leve", description: "" },
          { slug: "finesse", name: "Acuidade", description: "" },
        ],
        mastery: { slug: "nick", name: "Talho", description: "" },
      }),
    ).toBe(
      "Dano 1d4 · Perfurante · Leve, Acuidade · Maestria Talho · Alcance 6/18 m",
    );

    expect(
      armorListQuickHint({
        acFormula: "14 + Modificador de Des (máx. 2)",
        acBase: 14,
        strengthReq: null,
        categoryName: "Armadura Média",
        categorySlug: "medium",
        stealthDisadvantage: false,
      }),
    ).toBe("Armadura Média · CA 14 + Modificador de Des (máx. 2)");

    expect(
      armorListQuickHint({
        acFormula: "+2",
        acBase: null,
        strengthReq: null,
        categoryName: "Escudo",
        categorySlug: "shield",
        stealthDisadvantage: false,
      }),
    ).toBe("Escudo · Bônus CA +2");
  });
});
