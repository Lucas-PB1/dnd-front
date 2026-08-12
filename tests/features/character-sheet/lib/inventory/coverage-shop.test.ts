import { describe, expect, it } from "vitest";

import {
  catalogItemMatchesCoverage,
  inventoryHostMatchesCoverage,
  isCoverageItem,
  parseItemCoverageFromSummary,
} from "@/features/character/character-sheet/lib/inventory/coverage-shop";

describe("coverage-shop", () => {
  it("detects coverage items", () => {
    expect(
      isCoverageItem({
        kind: "coverage",
        properties: {
          kind: "coverage",
          appliesTo: "armor",
          appliesFilter: "Qualquer Leve, Média ou Pesada",
        },
      }),
    ).toBe(true);
  });

  it("matches mundane armor for adamantine coverage", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "armor",
        appliesFilter: "Qualquer Média ou Pesada, Exceto Gibão de Peles",
      },
    });
    expect(coverage).not.toBeNull();
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "chain-mail",
        name: "Cota de Malha",
        itemType: "armor",
        costText: "75 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "hide",
        name: "Gibão de Peles",
        itemType: "armor",
        costText: "10 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(false);
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "half-plate",
        name: "Meia-Placa",
        itemType: "armor",
        costText: "750 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "loriga-de-escamas-draconicas",
        name: "Loriga de Escamas Dracônicas",
        itemType: "armor",
        costText: "40000 PO",
        weight: null,
        description: null,
        properties: { magic: true },
      }),
    ).toBe(false);
  });

  it("matches shortbow and longbow for bow coverages", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "weapon",
        appliesFilter: "Arco Curto ou Arco Longo",
      },
    });
    expect(coverage).not.toBeNull();

    const shortbow = {
      slug: "shortbow",
      name: "Arco Curto",
      itemType: "weapon",
      costText: "25 PO",
      weight: null,
      description: null,
      properties: null,
    };
    const longbow = {
      slug: "longbow",
      name: "Arco Longo",
      itemType: "weapon",
      costText: "50 PO",
      weight: null,
      description: null,
      properties: null,
    };
    const dagger = {
      slug: "dagger",
      name: "Adaga",
      itemType: "weapon",
      costText: "2 PO",
      weight: null,
      description: null,
      properties: null,
    };

    expect(catalogItemMatchesCoverage(coverage!, shortbow)).toBe(true);
    expect(catalogItemMatchesCoverage(coverage!, longbow)).toBe(true);
    expect(catalogItemMatchesCoverage(coverage!, dagger)).toBe(false);
  });

  it("filters inventory hosts by coverage filter", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "weapon",
        appliesFilter: "Arco Curto ou Arco Longo",
      },
    });
    expect(coverage).not.toBeNull();

    expect(
      inventoryHostMatchesCoverage(
        {
          itemSlug: "shortbow",
          itemName: "Arco Curto",
          itemType: "weapon",
          quantity: 1,
          location: "backpack",
          equipmentSlot: null,
          attuned: false,
          effectsActive: false,
          effectsStatus: "inactive_unequipped",
          requiresAttunement: false,
          weightKg: 1,
        },
        coverage!,
      ),
    ).toBe(true);
    expect(
      inventoryHostMatchesCoverage(
        {
          itemSlug: "dagger",
          itemName: "Adaga",
          itemType: "weapon",
          quantity: 1,
          location: "backpack",
          equipmentSlot: null,
          attuned: false,
          effectsActive: false,
          effectsStatus: "inactive_unequipped",
          requiresAttunement: false,
          weightKg: 0.5,
        },
        coverage!,
      ),
    ).toBe(false);
  });

  it("matches listed melee weapons split by ou", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "weapon",
        appliesFilter: "Malho ou Martelo de Guerra",
      },
    });
    expect(coverage).not.toBeNull();
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "mace",
        name: "Malho",
        itemType: "weapon",
        costText: "5 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "warhammer",
        name: "Martelo de Guerra",
        itemType: "weapon",
        costText: "15 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
  });

  it("matches shield coverage for escudo base", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "shield",
        appliesFilter: "Escudo",
      },
    });
    expect(coverage).not.toBeNull();
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "shield",
        name: "Escudo",
        itemType: "armor",
        costText: "10 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
  });

  it("matches shield coverage for escudo base", () => {
    const coverage = parseItemCoverageFromSummary({
      kind: "coverage",
      properties: {
        kind: "coverage",
        appliesTo: "shield",
        appliesFilter: "Escudo",
      },
    });
    expect(coverage).not.toBeNull();
    expect(
      catalogItemMatchesCoverage(coverage!, {
        slug: "shield",
        name: "Escudo",
        itemType: "armor",
        costText: "10 PO",
        weight: null,
        description: null,
        properties: null,
      }),
    ).toBe(true);
  });
});
