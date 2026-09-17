import { describe, expect, it } from "vitest";

import { economyFeatSlugsFromCharacter } from "@/features/character/character-sheet/lib/combat/economy-feat-slugs";
import type { CharacterDetail } from "@/entities/character/types";

function character(
  overrides: Partial<
    Pick<
      CharacterDetail,
      "transformation" | "characterFeats" | "subclassOptions"
    >
  > = {},
): Pick<
  CharacterDetail,
  "transformation" | "characterFeats" | "subclassOptions"
> {
  return {
    transformation: null,
    characterFeats: [],
    subclassOptions: [],
    ...overrides,
  };
}

describe("economyFeatSlugsFromCharacter", () => {
  it("includes transformation, feats and fighting style options", () => {
    expect(
      economyFeatSlugsFromCharacter(
        character({
          transformation: {
            slug: "gh-transformation-fiend",
            stage: 1,
            choices: [],
          },
          characterFeats: [{ featSlug: "lucky", instanceIndex: 0 }],
          subclassOptions: [
            { optionKey: "fighting_style", valueId: "defense" },
            { optionKey: "huntersPrey", valueId: "colossus-slayer" },
          ],
        }),
      ),
    ).toEqual(["gh-transformation-fiend", "lucky", "defense"]);
  });
});
