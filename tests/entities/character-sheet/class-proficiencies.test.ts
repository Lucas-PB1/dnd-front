import { describe, expect, it } from "vitest";

import { PHB_2024_CLASSES } from "@/entities/character-sheet/classes";
import {
  findClassProficiencies,
  formatClassHitDice,
  getClassSkillPool,
  getProficiencyBonus,
  isValidClassSkillSelection,
  PHB_2024_CLASS_PROFICIENCIES,
} from "@/entities/character-sheet/class-proficiencies";

describe("PHB_2024_CLASS_PROFICIENCIES", () => {
  it("covers all twelve classes", () => {
    expect(PHB_2024_CLASS_PROFICIENCIES).toHaveLength(12);
    expect(PHB_2024_CLASS_PROFICIENCIES.map((entry) => entry.id)).toEqual(
      PHB_2024_CLASSES.map((entry) => entry.id),
    );
  });

  it("derives proficiency bonus from level", () => {
    expect(getProficiencyBonus("1")).toBe("2");
    expect(getProficiencyBonus("5")).toBe("3");
    expect(getProficiencyBonus("9")).toBe("4");
  });

  it("formats hit dice from class die and level", () => {
    expect(formatClassHitDice("d12", "3")).toBe("3d12");
    expect(formatClassHitDice("d6", "1")).toBe("1d6");
  });

  it("validates class skill selections", () => {
    const barbarian = findClassProficiencies("barbarian")!;

    expect(
      isValidClassSkillSelection(barbarian, ["athletics", "survival"]),
    ).toBe(true);
    expect(isValidClassSkillSelection(barbarian, ["athletics"])).toBe(false);
    expect(isValidClassSkillSelection(barbarian, ["arcana", "history"])).toBe(
      false,
    );
  });

  it("allows any three skills for bard", () => {
    const bard = findClassProficiencies("bard")!;

    expect(getClassSkillPool(bard)).toHaveLength(18);
    expect(
      isValidClassSkillSelection(bard, ["arcana", "stealth", "religion"]),
    ).toBe(true);
  });
});
