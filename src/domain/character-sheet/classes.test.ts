import { describe, expect, it } from "vitest";

import {
  CHARACTER_LEVELS,
  findCharacterClass,
  formatCharacterClassLevel,
  PHB_2024_CLASSES,
} from "@/domain/character-sheet/classes";

describe("PHB_2024_CLASSES", () => {
  it("lists all 12 classes from the 2024 player handbook", () => {
    expect(PHB_2024_CLASSES).toHaveLength(12);
    expect(
      PHB_2024_CLASSES.map((characterClass) => characterClass.name),
    ).toEqual([
      "Bárbaro",
      "Bardo",
      "Bruxo",
      "Clérigo",
      "Druida",
      "Feiticeiro",
      "Guardião",
      "Guerreiro",
      "Ladino",
      "Mago",
      "Monge",
      "Paladino",
    ]);
  });

  it("each class has four subclasses", () => {
    for (const characterClass of PHB_2024_CLASSES) {
      expect(characterClass.subclasses).toHaveLength(4);
    }
  });

  it("formats class and level for display", () => {
    expect(formatCharacterClassLevel("fighter", "5")).toBe("Guerreiro 5");
    expect(findCharacterClass("ranger")?.name).toBe("Guardião");
    expect(CHARACTER_LEVELS).toHaveLength(20);
  });
});
