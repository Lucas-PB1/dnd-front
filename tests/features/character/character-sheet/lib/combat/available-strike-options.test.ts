import { describe, expect, it } from "vitest";

import type { StrikeOption } from "@/entities/combat-mechanical/types";
import {
  availableStrikeOptions,
  knownStrikeOptionSlugs,
  strikeOptionSummary,
} from "@/features/character/character-sheet/lib/combat/available-strike-options";

function option(partial: Partial<StrikeOption> & Pick<StrikeOption, "slug">): StrikeOption {
  return {
    name: partial.name ?? partial.slug,
    extraDice: "1d6",
    extraDiceL18: "3d6",
    replacesAttackWithSave: false,
    ignoreTargetArmor: false,
    ignoreDamageResistance: false,
    addsArenaEffect: false,
    noteOnly: false,
    ...partial,
  };
}

describe("availableStrikeOptions", () => {
  const catalog = [
    option({ slug: "hunting-strike", subclassSlug: "blood-hound", name: "Caça" }),
    option({ slug: "other-strike", subclassSlug: "hunter", name: "Outro" }),
    option({ slug: "generic", name: "Genérico" }),
  ];

  it("filtra pela subclasse e inclui opções sem subclassSlug", () => {
    expect(
      availableStrikeOptions(catalog, { subclassSlug: "blood-hound" }).map(
        (row) => row.slug,
      ),
    ).toEqual(["hunting-strike", "generic"]);
  });
});

describe("knownStrikeOptionSlugs", () => {
  it("lê valueId das chaves bloodStrikeN", () => {
    expect(
      knownStrikeOptionSlugs([
        { optionKey: "bloodStrike1", valueId: "hunting-strike" },
        { optionKey: "hunterDefense", valueId: "nope" },
      ]),
    ).toEqual(["hunting-strike"]);
  });
});

describe("strikeOptionSummary", () => {
  it("usa extraDiceL18 no nível 18+", () => {
    const row = option({
      slug: "hunting-strike",
      costDice: "1d4",
      extraDice: "1d6",
      extraDiceL18: "3d6",
      damageType: "slashing",
    });
    expect(strikeOptionSummary(row, 17)).toContain("extra 1d6");
    expect(strikeOptionSummary(row, 18)).toContain("extra 3d6");
  });
});
