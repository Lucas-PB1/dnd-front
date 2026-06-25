import { describe, expect, it, vi } from "vitest";

import {
  applyClassProficiencyBase,
  syncClassSkillProficiencies,
} from "@/application/character-sheet/apply-class-proficiencies";

describe("applyClassProficiencies", () => {
  it("applies barbarian saving throws and training", () => {
    const setValue = vi.fn();

    applyClassProficiencyBase(setValue, "barbarian", "1");

    expect(setValue).toHaveBeenCalledWith(
      "savingThrows.strength.proficient",
      true,
    );
    expect(setValue).toHaveBeenCalledWith(
      "savingThrows.constitution.proficient",
      true,
    );
    expect(setValue).toHaveBeenCalledWith(
      "savingThrows.dexterity.proficient",
      false,
    );
    expect(setValue).toHaveBeenCalledWith(
      "weaponsProficiency",
      "Armas Simples e Marciais",
    );
    expect(setValue).toHaveBeenCalledWith("armorTrainingMedium", true);
    expect(setValue).toHaveBeenCalledWith("proficiencyBonus", "2");
    expect(setValue).toHaveBeenCalledWith("hitDice", "1d12");
  });

  it("syncs selected class skills to the sheet", () => {
    const setValue = vi.fn();

    syncClassSkillProficiencies(setValue, "rogue", [
      "stealth",
      "perception",
      "investigation",
      "deception",
    ]);

    expect(setValue).toHaveBeenCalledWith("skills.stealth.proficient", true);
    expect(setValue).toHaveBeenCalledWith("skills.athletics.proficient", false);
  });
});
