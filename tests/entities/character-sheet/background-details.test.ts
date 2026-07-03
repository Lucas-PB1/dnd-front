import { describe, expect, it } from "vitest";

import { PHB_2024_BACKGROUNDS } from "@/entities/character-sheet/origins";
import {
  findBackgroundDetails,
  getBackgroundAbilityBonuses,
  isBackgroundAbilitySelectionComplete,
  PHB_2024_BACKGROUND_DETAILS,
} from "@/entities/character-sheet/background-details";

describe("PHB_2024_BACKGROUND_DETAILS", () => {
  it("covers all sixteen backgrounds", () => {
    expect(PHB_2024_BACKGROUND_DETAILS).toHaveLength(16);
    expect(PHB_2024_BACKGROUND_DETAILS.map((entry) => entry.id)).toEqual(
      PHB_2024_BACKGROUNDS.map((entry) => entry.id),
    );
  });

  it("applies split ability increases from background options", () => {
    const bonuses = getBackgroundAbilityBonuses(
      "acolyte",
      "split",
      "wisdom",
      "charisma",
    );

    expect(bonuses.wisdom).toBe(2);
    expect(bonuses.charisma).toBe(1);
    expect(bonuses.intelligence).toBe(0);
  });

  it("applies +1 to all three background options in even mode", () => {
    const bonuses = getBackgroundAbilityBonuses("soldier", "even", "", "");

    expect(bonuses.strength).toBe(1);
    expect(bonuses.dexterity).toBe(1);
    expect(bonuses.constitution).toBe(1);
  });

  it("validates split selections", () => {
    expect(
      isBackgroundAbilitySelectionComplete(
        "guard",
        "split",
        "strength",
        "wisdom",
      ),
    ).toBe(true);
    expect(
      isBackgroundAbilitySelectionComplete(
        "guard",
        "split",
        "strength",
        "strength",
      ),
    ).toBe(false);
    expect(isBackgroundAbilitySelectionComplete("guard", "even", "", "")).toBe(
      true,
    );
  });

  it("includes origin feat and skills", () => {
    expect(findBackgroundDetails("sage")?.originFeat).toBe(
      "Iniciado em Magia (Mago)",
    );
    expect(findBackgroundDetails("sage")?.skills).toEqual([
      "arcana",
      "history",
    ]);
  });
});
