import { describe, expect, it } from "vitest";

import {
  canReloadFirearmChamber,
  canSpendFirearmChamber,
  firearmAttackShots,
} from "@/features/character/character-sheet/lib/combat/firearm-chamber";

describe("firearm-chamber", () => {
  it("gasta 2 tiros no modo automática", () => {
    expect(firearmAttackShots(false)).toBe(1);
    expect(firearmAttackShots(true)).toBe(2);
  });

  it("bloqueia disparo sem munição suficiente", () => {
    expect(canSpendFirearmChamber({ remaining: 0, shots: 1 })).toBe(false);
    expect(canSpendFirearmChamber({ remaining: 1, shots: 2 })).toBe(false);
    expect(canSpendFirearmChamber({ remaining: 2, shots: 2 })).toBe(true);
    expect(canSpendFirearmChamber({ remaining: null, shots: 1 })).toBe(true);
  });

  it("permite recarregar só com câmara incompleta", () => {
    expect(
      canReloadFirearmChamber({ remaining: 6, capacity: 6 }),
    ).toBe(false);
    expect(
      canReloadFirearmChamber({ remaining: 2, capacity: 6 }),
    ).toBe(true);
    expect(
      canReloadFirearmChamber({ remaining: null, capacity: 6 }),
    ).toBe(false);
  });
});
