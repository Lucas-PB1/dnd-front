import { describe, expect, it } from "vitest";

import { conditionListDelta } from "@/entities/character/lib/condition-list-delta";

describe("conditionListDelta", () => {
  it("lists slugs added and removed", () => {
    expect(
      conditionListDelta(["poisoned", "prone"], ["prone", "invisible"]),
    ).toEqual({
      addConditions: ["invisible"],
      removeConditions: ["poisoned"],
    });
  });

  it("returns empty arrays when the lists match", () => {
    expect(conditionListDelta(["poisoned"], ["poisoned"])).toEqual({
      addConditions: [],
      removeConditions: [],
    });
  });
});
