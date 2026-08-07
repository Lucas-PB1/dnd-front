import { describe, expect, it } from "vitest";

import type { ClassEconomyAction } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { planEconomyTableUse } from "@/features/character/character-sheet/lib/combat/plan-economy-table-use";

function action(
  partial: Partial<ClassEconomyAction> & Pick<ClassEconomyAction, "id" | "name">,
): ClassEconomyAction {
  return {
    economy: "bonus",
    classSlug: "fighter",
    minLevel: 3,
    ...partial,
  };
}

describe("planEconomyTableUse", () => {
  it("uses free charge before spending the psi pool", () => {
    const remaining = new Map([
      ["telekinetic-movement", { remaining: 1, max: 1 }],
      ["psi-energy-dice", { remaining: 4, max: 8 }],
    ]);
    const plan = planEconomyTableUse({
      action: action({
        id: "move",
        name: "Movimento",
        tableAction: "psi:telekinetic-movement",
        resourceSlug: "psi-energy-dice",
        freeResourceSlug: "telekinetic-movement",
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
    });
    expect(plan.canUse).toBe(true);
    expect(plan.usePsiDie).toBe(false);
    expect(plan.buttonLabel).toBe("Usar (gratuito)");
    expect(plan.counterSlug).toBe("telekinetic-movement");
  });

  it("spends a die when free use is gone", () => {
    const remaining = new Map([
      ["telekinetic-movement", { remaining: 0, max: 1 }],
      ["psi-energy-dice", { remaining: 4, max: 8 }],
    ]);
    const plan = planEconomyTableUse({
      action: action({
        id: "move",
        name: "Movimento",
        tableAction: "psi:telekinetic-movement",
        resourceSlug: "psi-energy-dice",
        freeResourceSlug: "telekinetic-movement",
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
    });
    expect(plan.canUse).toBe(true);
    expect(plan.usePsiDie).toBe(true);
    expect(plan.buttonLabel).toBe("Usar (1 dado)");
  });

  it("always spends for protective field", () => {
    const remaining = new Map([
      ["psi-energy-dice", { remaining: 2, max: 8 }],
    ]);
    const plan = planEconomyTableUse({
      action: action({
        id: "field",
        name: "Campo",
        tableAction: "psi:protective-field",
        resourceSlug: "psi-energy-dice",
        alwaysSpendsResource: true,
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
    });
    expect(plan.usePsiDie).toBe(true);
    expect(plan.buttonLabel).toBe("Usar (1 dado)");
  });

  it("casts free magic missile when uses remain", () => {
    const remaining = new Map([
      ["magic-missile-free", { remaining: 2, max: 2 }],
    ]);
    const plan = planEconomyTableUse({
      action: action({
        id: "mm-free",
        name: "Mísseis Gratuitos",
        classSlug: "wizard",
        tableAction: "cast:misseis-magicos-free",
        resourceSlug: "magic-missile-free",
        alwaysSpendsResource: true,
        spendAmount: 1,
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
    });
    expect(plan.canUse).toBe(true);
    expect(plan.buttonLabel).toBe("Conjurar");
    expect(plan.usePsiDie).toBe(false);
  });

  it("arms and disarms missile shield", () => {
    const remaining = new Map([
      ["missile-shield", { remaining: 1, max: 1 }],
    ]);
    const armed = planEconomyTableUse({
      action: action({
        id: "shield",
        name: "Escudo",
        tableAction: "arm:missile-shield",
        resourceSlug: "missile-shield",
        alwaysSpendsResource: true,
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
      missileShieldArmed: false,
    });
    expect(armed.buttonLabel).toBe("Armar");
    expect(armed.canUse).toBe(true);
    expect(armed.counterSlug).toBe("missile-shield");

    const disarm = planEconomyTableUse({
      action: action({
        id: "shield",
        name: "Escudo",
        tableAction: "arm:missile-shield",
        resourceSlug: "missile-shield",
        alwaysSpendsResource: true,
      }),
      remainingBySlug: remaining,
      preferSpendPool: false,
      missileShieldArmed: true,
    });
    expect(disarm.buttonLabel).toBe("Desarmar");
    expect(disarm.armed).toBe(true);
  });

  it("reminder rows without tableAction have no counter", () => {
    const plan = planEconomyTableUse({
      action: action({
        id: "versatile",
        name: "Mísseis Versáteis",
        classSlug: "wizard",
        tableAction: undefined,
        summary: "Tombo 1 / Cegar 3 / Atordoar 5",
      }),
      remainingBySlug: new Map(),
      preferSpendPool: false,
    });
    expect(plan.canUse).toBe(false);
    expect(plan.counterSlug).toBeNull();
  });
});
