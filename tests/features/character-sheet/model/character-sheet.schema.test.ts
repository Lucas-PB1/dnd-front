import { describe, expect, it } from "vitest";

import {
  characterSheetSchema,
  createEmptyCharacterSheet,
} from "@/features/character-sheet/model/character-sheet.schema";
import {
  SKILL_DEFINITIONS,
  WEAPON_ROW_COUNT,
} from "@/entities/character-sheet/constants";

describe("createEmptyCharacterSheet", () => {
  it("returns a valid empty sheet", () => {
    const sheet = createEmptyCharacterSheet();

    expect(characterSheetSchema.parse(sheet)).toEqual(sheet);
    expect(sheet.characterName).toBe("");
    expect(sheet.deathSaveSuccesses).toBe(0);
    expect(sheet.weapons).toHaveLength(WEAPON_ROW_COUNT);
    expect(sheet.weapons.every((row) => row.name === "")).toBe(true);
  });

  it("has empty proficiency for every skill", () => {
    const sheet = createEmptyCharacterSheet();

    for (const skill of SKILL_DEFINITIONS) {
      expect(sheet.skills[skill.key]).toEqual({
        proficient: false,
        modifier: "",
      });
    }
  });
});
