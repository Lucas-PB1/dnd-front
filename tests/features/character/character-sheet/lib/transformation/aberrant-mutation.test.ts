import { describe, expect, it } from "vitest";

import {
  ABERRANT_MUTATION_ACTION,
  ABERRANT_MUTATION_SLUGS,
  aberrantMutationLabel,
  isAberrantMutationAction,
  isAberrantMutationSlug,
} from "@/features/character/character-sheet/lib/transformation/aberrant-mutation";
import {
  mesaCircumstanceTagForAction,
  isMesaCircumstanceToggleAction,
} from "@/features/character/character-sheet/lib/combat/mesa-circumstances";

describe("aberrant-mutation helpers", () => {
  it("recognizes the economy table action", () => {
    expect(isAberrantMutationAction(ABERRANT_MUTATION_ACTION)).toBe(true);
    expect(isAberrantMutationAction("gh-transformation-fiend/infernal-smite")).toBe(
      false,
    );
  });

  it("validates and labels mutation slugs", () => {
    expect(ABERRANT_MUTATION_SLUGS).toContain("slimy-form");
    expect(isAberrantMutationSlug("eldritch-limbs")).toBe(true);
    expect(isAberrantMutationSlug("nope")).toBe(false);
    expect(aberrantMutationLabel("chitinous-shell")).toBe("Casca Quitinosa");
  });
});

describe("mesa-circumstances helpers", () => {
  it("maps toggle actions to tags", () => {
    expect(mesaCircumstanceTagForAction("snowrunner-toggle-snow-ice")).toBe(
      "snow_ice",
    );
    expect(
      mesaCircumstanceTagForAction("cold-plunge-toggle-in-water"),
    ).toBe("in_water");
    expect(
      mesaCircumstanceTagForAction("cold-plunge-toggle-extreme-cold"),
    ).toBe("extreme_cold");
    expect(isMesaCircumstanceToggleAction("artisan-craft")).toBe(false);
  });
});
