import { describe, expect, it, vi } from "vitest";

import {
  assignmentToScores,
  createDefaultPointBuyScores,
  createEmptyAssignment,
  getPointBuyRemaining,
  getPointBuyTotalSpent,
  increasePointBuy,
  isAssignmentComplete,
  isPointBuyComplete,
  isRollSumInRange,
  POINT_BUY_TOTAL,
  roll4d6DropLowest,
  STANDARD_ABILITY_ARRAY,
  STANDARD_ABILITY_ARRAY_TOTAL,
  sumRollPool,
} from "@/entities/character-sheet/ability-score-generation";

describe("ability score generation", () => {
  it("uses the PHB 2024 standard array", () => {
    expect([...STANDARD_ABILITY_ARRAY]).toEqual([15, 14, 13, 12, 10, 8]);
    expect(STANDARD_ABILITY_ARRAY_TOTAL).toBe(72);
  });

  it("rolls 4d6 dropping the lowest die", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.83)
      .mockReturnValueOnce(0.99);

    expect(roll4d6DropLowest()).toEqual({
      value: 15,
      dice: [1, 4, 5, 6],
      dropped: 1,
    });

    vi.restoreAllMocks();
  });

  it("validates roll totals between 72 and 80", () => {
    expect(isRollSumInRange(71)).toBe(false);
    expect(isRollSumInRange(72)).toBe(true);
    expect(isRollSumInRange(80)).toBe(true);
    expect(isRollSumInRange(81)).toBe(false);
    expect(sumRollPool([15, 14, 13, 12, 10, 8])).toBe(72);
  });

  it("tracks point buy spending from PHB costs", () => {
    const scores = createDefaultPointBuyScores();
    expect(getPointBuyTotalSpent(scores)).toBe(0);
    expect(getPointBuyRemaining(scores)).toBe(POINT_BUY_TOTAL);

    let current = scores;
    for (let index = 0; index < 7; index += 1) {
      const next = increasePointBuy(current, "strength");
      expect(next).not.toBeNull();
      current = next!;
    }

    expect(current.strength).toBe(15);
    expect(getPointBuyTotalSpent(current)).toBe(9);
    expect(isPointBuyComplete(current)).toBe(false);
  });

  it("builds ability scores from completed assignments", () => {
    const assigned = createEmptyAssignment();
    expect(isAssignmentComplete(assigned)).toBe(false);
    expect(assignmentToScores(assigned)).toBeNull();

    assigned.strength = 15;
    assigned.dexterity = 14;
    assigned.constitution = 13;
    assigned.intelligence = 12;
    assigned.wisdom = 10;
    assigned.charisma = 8;

    expect(assignmentToScores(assigned)).toEqual({
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });
  });
});
