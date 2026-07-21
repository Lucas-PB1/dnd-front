import { describe, expect, it } from "vitest";

import {
  filterOptionsExcludingTaken,
  siblingFeatOptionValueIds,
} from "@/features/create-character/lib/granted-proficiencies";

describe("granted-proficiencies", () => {
  it("filters options already granted", () => {
    const options = [
      { value: "insight", label: "Intuição" },
      { value: "athletics", label: "Atletismo" },
      { value: "stealth", label: "Furtividade" },
    ];
    expect(
      filterOptionsExcludingTaken(options, ["insight", "stealth"]).map(
        (o) => o.value,
      ),
    ).toEqual(["athletics"]);
  });

  it("keeps the currently selected value visible", () => {
    const options = [
      { value: "insight", label: "Intuição" },
      { value: "athletics", label: "Atletismo" },
    ];
    expect(
      filterOptionsExcludingTaken(options, ["insight"], "insight").map(
        (o) => o.value,
      ),
    ).toEqual(["insight", "athletics"]);
  });

  it("collects sibling feat option values", () => {
    expect(
      siblingFeatOptionValueIds(
        [
          {
            featSlug: "skilled",
            instanceIndex: 0,
            optionKey: "proficiency1",
            valueId: "insight",
          },
          {
            featSlug: "skilled",
            instanceIndex: 0,
            optionKey: "proficiency2",
            valueId: "stealth",
          },
          {
            featSlug: "artisan",
            instanceIndex: 0,
            optionKey: "artisanTool1",
            valueId: "ferramentas-de-ferreiro",
          },
        ],
        "skilled",
        0,
        "proficiency3",
      ),
    ).toEqual(["insight", "stealth"]);
  });
});
