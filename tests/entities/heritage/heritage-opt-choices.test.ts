import { describe, expect, it } from "vitest";

import {
  pruneHeritageOptChoices,
  requiredHeritageOptKinds,
} from "@/entities/heritage";

const catalog = [
  { traitSlug: "potent-breath", optionKey: "damageType" },
  { traitSlug: "potent-breath", optionKey: "aoeShape" },
];

describe("requiredHeritageOptKinds", () => {
  it("asks for one option set per slot that picked the trait", () => {
    expect(
      requiredHeritageOptKinds(
        [
          { choiceKind: "heritage_trait_1", choiceSlug: "potent-breath" },
          { choiceKind: "heritage_trait_2", choiceSlug: "animal-ally" },
        ],
        catalog,
      ),
    ).toEqual(["heritage_opt_1_damageType", "heritage_opt_1_aoeShape"]);
  });
});

describe("pruneHeritageOptChoices", () => {
  it("drops option picks whose trait left the slot", () => {
    const next = pruneHeritageOptChoices(
      [
        { choiceKind: "heritage_trait_1", choiceSlug: "animal-ally" },
        { choiceKind: "heritage_opt_1_damageType", choiceSlug: "fire" },
      ],
      catalog,
    );
    expect(next).toEqual([
      { choiceKind: "heritage_trait_1", choiceSlug: "animal-ally" },
    ]);
  });
});
