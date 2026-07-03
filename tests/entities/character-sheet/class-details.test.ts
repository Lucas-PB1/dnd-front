import { describe, expect, it } from "vitest";

import { PHB_2024_CLASSES } from "@/entities/character-sheet/classes";
import {
  findClassDetails,
  findSubclassDetail,
  isSubclassUnlocked,
  PHB_2024_CLASS_DETAILS,
  SUBCLASS_UNLOCK_LEVEL,
} from "@/entities/character-sheet/class-details";

describe("PHB_2024_CLASS_DETAILS", () => {
  it("covers all twelve classes", () => {
    expect(PHB_2024_CLASS_DETAILS).toHaveLength(12);
    expect(PHB_2024_CLASS_DETAILS.map((entry) => entry.id)).toEqual(
      PHB_2024_CLASSES.map((entry) => entry.id),
    );
  });

  it("matches subclass ids from classes.ts", () => {
    for (const characterClass of PHB_2024_CLASSES) {
      const details = findClassDetails(characterClass.id);
      expect(details).toBeDefined();
      expect(details?.subclasses.map((entry) => entry.id)).toEqual(
        characterClass.subclasses.map((entry) => entry.id),
      );
    }
  });

  it("unlocks subclass choice from level 3", () => {
    expect(SUBCLASS_UNLOCK_LEVEL).toBe(3);
    expect(isSubclassUnlocked("1")).toBe(false);
    expect(isSubclassUnlocked("2")).toBe(false);
    expect(isSubclassUnlocked("3")).toBe(true);
    expect(isSubclassUnlocked("20")).toBe(true);
  });

  it("finds subclass summaries", () => {
    expect(findSubclassDetail("barbarian", "berserker")?.summary).toContain(
      "violência",
    );
  });
});
