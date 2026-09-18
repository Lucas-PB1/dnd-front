import { describe, expect, it } from "vitest";

import {
  applyDamageRollChoice,
  hasPendingDamageRollChoice,
} from "@/features/character/character-sheet/lib/combat/apply-damage-roll-choice";
import type { CharacterRollResult } from "@/features/character/character-sheet/api/character-rolls.api";

const baseResult: CharacterRollResult = {
  kind: "damage",
  label: "Dano — Espada (Atacante Selvagem)",
  expression: "8+3+5",
  total: 16,
  modifier: 3,
  rolls: [5, 3, 5],
  note: "Atacante Selvagem: escolha entre esta rolagem e alternateRolls[0] (1×/turno).",
  alternateRolls: [
    {
      expression: "11+3+5",
      total: 19,
      rolls: [6, 5],
    },
  ],
};

describe("applyDamageRollChoice", () => {
  it("keeps the primary total when choosing the first roll", () => {
    const chosen = applyDamageRollChoice(baseResult, "primary");
    expect(chosen.total).toBe(16);
    expect(chosen.alternateRolls).toBeUndefined();
    expect(chosen.note).toContain("1ª rolagem");
  });

  it("swaps to the alternate full total when choosing the second roll", () => {
    const chosen = applyDamageRollChoice(baseResult, "alternate");
    expect(chosen.total).toBe(19);
    expect(chosen.expression).toBe("11+3+5");
    expect(chosen.rolls).toEqual([6, 5]);
    expect(chosen.alternateRolls).toBeUndefined();
    expect(chosen.note).toContain("2ª rolagem");
  });

  it("detects pending choice", () => {
    expect(hasPendingDamageRollChoice(baseResult)).toBe(true);
    expect(
      hasPendingDamageRollChoice(applyDamageRollChoice(baseResult, "primary")),
    ).toBe(false);
  });
});
