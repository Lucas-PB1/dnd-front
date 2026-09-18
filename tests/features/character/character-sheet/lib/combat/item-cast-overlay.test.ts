import { describe, expect, it } from "vitest";

import {
  buildItemCastOverlay,
  isItemSpellCastAction,
  itemCastOverlayChipLabels,
  shouldConfirmConcentrationSwap,
} from "@/features/character/character-sheet/lib/combat/item-cast-overlay";

describe("isItemSpellCastAction", () => {
  it("requires both item and spell slugs", () => {
    expect(
      isItemSpellCastAction({
        itemSlug: "varinha-de-relampagos",
        spellSlug: "raio",
      }),
    ).toBe(true);
    expect(isItemSpellCastAction({ itemSlug: "varinha-de-relampagos" })).toBe(
      false,
    );
    expect(isItemSpellCastAction({ spellSlug: "raio" })).toBe(false);
  });
});

describe("buildItemCastOverlay", () => {
  it("reads Treasure CD and default no-components from inventory", () => {
    const overlay = buildItemCastOverlay({
      itemSlug: "varinha-de-relampagos",
      inventoryItems: [
        {
          itemSlug: "varinha-de-relampagos",
          spellSaveDc: 15,
          spellAttackBonus: null,
          requiresComponents: false,
          useCasterAbility: false,
        },
      ],
      spellSlug: "raio",
      requiresConcentration: false,
    });
    expect(overlay).toEqual({
      saveDc: 15,
      attackBonus: null,
      noComponents: true,
      requiresConcentration: false,
      useCasterAbility: false,
    });
    expect(itemCastOverlayChipLabels(overlay!)).toEqual([
      "CD 15",
      "Sem componentes",
    ]);
  });

  it("falls back to Enspelled CD by spell level when inventory has no CD", () => {
    const overlay = buildItemCastOverlay({
      itemSlug: "arma-magificada",
      inventoryItems: [
        {
          itemSlug: "espada-longa",
          location: "equipped",
          attachedCoverageSlug: "arma-magificada",
          spellSaveDc: null,
          requiresComponents: false,
        },
      ],
      spellSlug: "bola-de-fogo",
      spellLevel: 3,
      requiresConcentration: true,
    });
    expect(overlay?.saveDc).toBe(15);
    expect(overlay?.attackBonus).toBe(7);
    expect(itemCastOverlayChipLabels(overlay!)).toEqual([
      "CD 15",
      "Sem componentes",
      "Concentração",
    ]);
  });

  it("marks components when the item requires them", () => {
    const overlay = buildItemCastOverlay({
      itemSlug: "pergaminho",
      inventoryItems: [
        {
          itemSlug: "pergaminho",
          requiresComponents: true,
          spellSaveDc: null,
        },
      ],
    });
    expect(overlay?.noComponents).toBe(false);
    expect(itemCastOverlayChipLabels(overlay!)).toEqual([]);
  });
});

describe("shouldConfirmConcentrationSwap", () => {
  it("asks only when swapping to another concentration spell", () => {
    expect(
      shouldConfirmConcentrationSwap({
        concentratingOn: "escudo",
        spellSlug: "nevoa",
        requiresConcentration: true,
      }),
    ).toBe(true);
    expect(
      shouldConfirmConcentrationSwap({
        concentratingOn: "nevoa",
        spellSlug: "nevoa",
        requiresConcentration: true,
      }),
    ).toBe(false);
    expect(
      shouldConfirmConcentrationSwap({
        concentratingOn: "escudo",
        spellSlug: "raio",
        requiresConcentration: false,
      }),
    ).toBe(false);
    expect(
      shouldConfirmConcentrationSwap({
        concentratingOn: null,
        spellSlug: "nevoa",
        requiresConcentration: true,
      }),
    ).toBe(false);
  });
});
