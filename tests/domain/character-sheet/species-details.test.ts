import { describe, expect, it } from "vitest";

import { PHB_2024_SPECIES } from "@/domain/character-sheet/origins";
import {
  findSpeciesDetails,
  formatSpeciesTraitsText,
  getSpeciesSheetDefaults,
  PHB_2024_SPECIES_DETAILS,
} from "@/domain/character-sheet/species-details";

describe("PHB_2024 species details", () => {
  it("covers every selectable species", () => {
    expect(PHB_2024_SPECIES_DETAILS).toHaveLength(PHB_2024_SPECIES.length);
    for (const species of PHB_2024_SPECIES) {
      expect(findSpeciesDetails(species.id)).toBeDefined();
    }
  });

  it("maps golias to faster speed", () => {
    const goliath = findSpeciesDetails("goliath");
    expect(goliath?.speedFeet).toBe(35);
    expect(goliath?.speedLabel).toBe("10,5 metros");
  });

  it("builds sheet defaults for combat and traits steps", () => {
    const defaults = getSpeciesSheetDefaults("elf");
    expect(defaults?.speed).toBe("9 metros");
    expect(defaults?.size).toBe("Médio");
    expect(defaults?.speciesTraits).toContain("Linhagem Élfica");
    expect(formatSpeciesTraitsText(findSpeciesDetails("elf")!)).toBe(
      defaults?.speciesTraits,
    );
  });
});
