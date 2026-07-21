import { describe, expect, it } from "vitest";

import {
  languageQuota,
  syncLanguagesForSpecies,
  toggleLanguageSelection,
} from "@/features/create-character/lib/language-selection";

describe("language-selection", () => {
  it("gives dragonborn common + draconic with no extras", () => {
    expect(languageQuota("dragonborn")).toEqual({
      granted: ["common", "draconic"],
      choiceCount: 0,
      maxTotal: 2,
    });
  });

  it("lets human pick one extra language", () => {
    expect(languageQuota("human")).toEqual({
      granted: ["common"],
      choiceCount: 1,
      maxTotal: 2,
    });

    const first = toggleLanguageSelection(["common"], "elvish", "human");
    expect(first).toEqual({ ok: true, next: ["common", "elvish"] });

    const blocked = toggleLanguageSelection(
      ["common", "elvish"],
      "dwarvish",
      "human",
    );
    expect(blocked.ok).toBe(false);
  });

  it("locks granted languages", () => {
    const result = toggleLanguageSelection(
      ["common", "draconic"],
      "common",
      "dragonborn",
    );
    expect(result.ok).toBe(false);
  });

  it("syncs selection when species changes", () => {
    expect(
      syncLanguagesForSpecies(
        ["common", "elvish", "dwarvish"],
        "dragonborn",
      ),
    ).toEqual(["common", "draconic"]);
  });

  it("uses abyssal for abyssal tiefling legacy", () => {
    expect(
      languageQuota("tiefling", [
        { choiceKind: "infernal_legacy", choiceSlug: "abyssal" },
      ]),
    ).toEqual({
      granted: ["common", "abyssal"],
      choiceCount: 0,
      maxTotal: 2,
    });
  });
});
