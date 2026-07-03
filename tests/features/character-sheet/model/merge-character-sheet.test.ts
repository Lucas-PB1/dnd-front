import { describe, expect, it } from "vitest";

import { mergeCharacterSheet } from "@/features/character-sheet/model/merge-character-sheet";
import { createEmptyCharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";

describe("mergeCharacterSheet", () => {
  it("returns empty sheet when partial is undefined", () => {
    expect(mergeCharacterSheet(undefined)).toEqual(createEmptyCharacterSheet());
  });

  it("merges partial values over defaults", () => {
    const merged = mergeCharacterSheet({
      characterName: "Aragorn",
      abilities: {
        strength: { score: "18", modifier: "+4" },
      },
    });

    expect(merged.characterName).toBe("Aragorn");
    expect(merged.abilities.strength).toEqual({ score: "18", modifier: "+4" });
    expect(merged.abilities.dexterity).toEqual({ score: "", modifier: "" });
  });
});
