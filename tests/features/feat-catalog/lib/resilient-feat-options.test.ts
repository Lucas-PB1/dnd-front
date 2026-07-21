import { describe, expect, it } from "vitest";

import { filterResilientAbilityOptionValues } from "@/features/feat-catalog/lib/resilient-feat-options";

describe("filterResilientAbilityOptionValues", () => {
  const values = [
    { valueId: "forca", label: "Força" },
    { valueId: "destreza", label: "Destreza" },
    { valueId: "constituicao", label: "Constituição" },
  ];

  it("filters class save proficiencies for resilient", () => {
    expect(
      filterResilientAbilityOptionValues("resilient", values, [
        "forca",
        "constituicao",
      ]),
    ).toEqual([{ valueId: "destreza", label: "Destreza" }]);
  });

  it("leaves values unchanged for other feats", () => {
    expect(
      filterResilientAbilityOptionValues("alert", values, ["forca"]),
    ).toEqual(values);
  });
});
