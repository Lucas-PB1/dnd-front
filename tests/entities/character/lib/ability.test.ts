import { describe, expect, it } from "vitest";

import {
  abilityModifier,
  abilityModifierValue,
  formatSkillBonus,
  skillBonus,
} from "@/entities/character/lib/ability";
import { isSubclassRequired } from "@/entities/character/lib/subclass";

describe("ability helpers", () => {
  it("computes modifier values", () => {
    expect(abilityModifierValue(10)).toBe(0);
    expect(abilityModifierValue(15)).toBe(2);
    expect(abilityModifierValue(8)).toBe(-1);
  });

  it("formats modifiers", () => {
    expect(abilityModifier(15)).toBe("+2");
    expect(abilityModifier(8)).toBe("-1");
  });

  it("computes skill bonus with proficiency", () => {
    expect(skillBonus(14, false, 2)).toBe(2);
    expect(skillBonus(14, true, 2)).toBe(4);
    expect(formatSkillBonus(4)).toBe("+4");
  });
});

describe("subclass helpers", () => {
  it("requires subclass from catalog unlock level", () => {
    expect(isSubclassRequired(2, 3)).toBe(false);
    expect(isSubclassRequired(3, 3)).toBe(true);
    expect(isSubclassRequired(5, 10)).toBe(false);
    expect(isSubclassRequired(5, null)).toBe(false);
  });
});
