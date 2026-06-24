import { describe, expect, it } from "vitest";

import {
  findBackgroundName,
  findSpeciesName,
  PHB_2024_BACKGROUNDS,
  PHB_2024_SPECIES,
} from "@/domain/character-sheet/origins";

describe("PHB_2024 origins", () => {
  it("lists 10 species from the 2024 player handbook", () => {
    expect(PHB_2024_SPECIES).toHaveLength(10);
    expect(findSpeciesName("halfling")).toBe("Pequenino");
    expect(findSpeciesName("dwarf")).toBe("Anão");
  });

  it("lists 16 backgrounds from the 2024 player handbook", () => {
    expect(PHB_2024_BACKGROUNDS).toHaveLength(16);
    expect(findBackgroundName("wanderer")).toBe("Andarilho");
    expect(findBackgroundName("scribe")).toBe("Escriba");
  });
});
