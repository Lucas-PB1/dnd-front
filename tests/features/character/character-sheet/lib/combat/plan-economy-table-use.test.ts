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
});
