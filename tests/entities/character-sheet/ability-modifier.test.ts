import { describe, expect, it } from "vitest";

import { formatAbilityModifier } from "@/entities/character-sheet/ability-modifier";

describe("formatAbilityModifier", () => {
  it("returns modifier for standard scores", () => {
    expect(formatAbilityModifier("10")).toBe("+0");
    expect(formatAbilityModifier("16")).toBe("+3");
    expect(formatAbilityModifier("8")).toBe("-1");
  });

  it("returns null for empty or invalid input", () => {
    expect(formatAbilityModifier("")).toBeNull();
    expect(formatAbilityModifier("abc")).toBeNull();
  });
});
