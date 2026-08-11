import { describe, expect, it } from "vitest";

import { resolveFeatProficiencyOptions } from "@/features/catalog/feat-catalog/lib/resolve-feat-proficiency-options";
import type { FeatOptionDefinition } from "@/entities/feat/types";

function def(
  partial: Partial<FeatOptionDefinition> & Pick<FeatOptionDefinition, "optionKey">,
): FeatOptionDefinition {
  return {
    label: partial.optionKey,
    valueType: "proficiency",
    sortOrder: 1,
    dependsOnOptionKey: null,
    spellMaxLevel: null,
    spellSchoolSlugs: null,
    spellRitualOnly: false,
    values: [],
    ...partial,
  };
}

describe("resolveFeatProficiencyOptions", () => {
  it("uses API whitelist and drops generic instrument", () => {
    const options = resolveFeatProficiencyOptions(
      def({
        optionKey: "musicalInstrument1",
        values: [
          { valueId: "instrumento-musical", label: "Instrumento Musical", sortOrder: 0 },
          { valueId: "alaude", label: "Alaúde", sortOrder: 1 },
        ],
      }),
      [{ value: "stealth", label: "Furtividade" }],
    );
    expect(options).toEqual([{ value: "alaude", label: "Alaúde" }]);
  });

  it("falls back to local instruments when API whitelist is empty", () => {
    const options = resolveFeatProficiencyOptions(
      def({ optionKey: "musicalInstrument2", values: [] }),
      [],
    );
    expect(options.some((o) => o.value === "alaude")).toBe(true);
    expect(options.some((o) => o.value === "instrumento-musical")).toBe(false);
  });
});
