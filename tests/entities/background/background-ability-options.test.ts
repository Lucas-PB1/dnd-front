import { describe, expect, it } from "vitest";

import {
  buildBackgroundAbilityBoostOptions,
  isBackgroundAbilityBoostAllowed,
} from "@/entities/background/lib/background-ability-options";

describe("buildBackgroundAbilityBoostOptions", () => {
  it("maps only allowed slugs with PT labels", () => {
    const options = buildBackgroundAbilityBoostOptions(
      ["destreza", "constituicao", "sabedoria"],
      ["Destreza", "Constituição", "Sabedoria"],
    );
    expect(options).toEqual([
      { value: "destreza", label: "Destreza" },
      { value: "constituicao", label: "Constituição" },
      { value: "sabedoria", label: "Sabedoria" },
    ]);
  });

  it("filters empty slugs", () => {
    const options = buildBackgroundAbilityBoostOptions(
      ["forca", "", "carisma"],
      ["Força", "", "Carisma"],
    );
    expect(options).toHaveLength(2);
  });
});

describe("isBackgroundAbilityBoostAllowed", () => {
  it("rejects values outside the background list", () => {
    expect(
      isBackgroundAbilityBoostAllowed("forca", [
        "destreza",
        "constituicao",
        "sabedoria",
      ]),
    ).toBe(false);
    expect(
      isBackgroundAbilityBoostAllowed("constituicao", [
        "destreza",
        "constituicao",
        "sabedoria",
      ]),
    ).toBe(true);
  });
});
