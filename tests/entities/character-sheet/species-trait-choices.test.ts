import { describe, expect, it } from "vitest";

import {
  formatSpeciesTraitsForSheet,
  getSpeciesSkillChoicePool,
  isValidSpeciesSkillChoice,
} from "@/entities/character-sheet/species-trait-choices";

describe("species trait choices", () => {
  it("allows any skill for human hábil", () => {
    expect(getSpeciesSkillChoicePool("human")).toHaveLength(18);
    expect(isValidSpeciesSkillChoice("human", "stealth")).toBe(true);
  });

  it("limits elf sentidos aguçados to three skills", () => {
    expect(getSpeciesSkillChoicePool("elf")).toEqual([
      "insight",
      "perception",
      "survival",
    ]);
    expect(isValidSpeciesSkillChoice("elf", "stealth")).toBe(false);
  });

  it("embeds resolved choices in species traits text", () => {
    expect(
      formatSpeciesTraitsForSheet("human", {
        skillChoice: "stealth",
        originFeat: "Habilidoso",
      }),
    ).toContain("Proficiência em Furtividade");
    expect(
      formatSpeciesTraitsForSheet("human", {
        skillChoice: "stealth",
        originFeat: "Habilidoso",
      }),
    ).toContain("Talento de Origem: Habilidoso");

    expect(
      formatSpeciesTraitsForSheet("elf", { skillChoice: "perception" }),
    ).toContain("Proficiência em Percepção");
  });
});
