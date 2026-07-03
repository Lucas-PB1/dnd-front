import { describe, expect, it, vi } from "vitest";

import {
  buildOriginFeatsText,
  buildToolsText,
  setAbilityBaseScores,
  syncAbilityScoresWithOriginBonuses,
} from "@/features/character-sheet/model/apply-origin-benefits";

describe("applyOriginBenefits", () => {
  it("adds background bonuses to base scores", () => {
    const setValue = vi.fn();
    const watch = vi.fn((path: string) => {
      if (path === "abilityBaseScores.strength") return "15";
      if (path === "abilityBaseScores.wisdom") return "10";
      if (path === "abilityBaseScores.charisma") return "8";
      return "";
    });

    syncAbilityScoresWithOriginBonuses(
      setValue,
      watch,
      "acolyte",
      "split",
      "wisdom",
      "charisma",
    );

    expect(setValue).toHaveBeenCalledWith("abilities.wisdom.score", "12");
    expect(setValue).toHaveBeenCalledWith("abilities.charisma.score", "9");
    expect(setValue).toHaveBeenCalledWith("abilities.wisdom.modifier", "+1");
  });

  it("stores generated base scores", () => {
    const setValue = vi.fn();

    setAbilityBaseScores(setValue, {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });

    expect(setValue).toHaveBeenCalledWith("abilityBaseScores.strength", "15");
    expect(setValue).toHaveBeenCalledWith("abilityBaseScores.charisma", "8");
  });

  it("builds origin feats from background and human versatile", () => {
    expect(buildOriginFeatsText("acolyte", "human", "Habilidoso")).toBe(
      "Iniciado em Magia (Clérigo)\nHabilidoso",
    );
    expect(buildOriginFeatsText("acolyte", "elf", "")).toBe(
      "Iniciado em Magia (Clérigo)",
    );
  });

  it("merges class and background tool proficiencies", () => {
    expect(buildToolsText("druid", "acolyte")).toBe(
      "Kit de Herbalismo · Suprimentos de Calígrafo",
    );
  });
});
