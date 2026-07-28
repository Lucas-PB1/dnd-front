import { describe, expect, it } from "vitest";

import {
  languageQuota,
  syncLanguagesForBackground,
  toggleLanguageSelection,
} from "@/features/character/create-character/lib/languages/language-selection";

const acolyte = {
  grantedSlugs: ["common"],
  languageChoiceCount: 2,
};

describe("language-selection", () => {
  it("uses background common + 2 choices by default", () => {
    expect(languageQuota(acolyte)).toEqual({
      granted: ["common"],
      choiceCount: 2,
      maxTotal: 3,
    });
  });

  it("lets the player pick two extra languages", () => {
    const first = toggleLanguageSelection(["common"], "elvish", acolyte);
    expect(first).toEqual({ ok: true, next: ["common", "elvish"] });

    const second = toggleLanguageSelection(
      ["common", "elvish"],
      "dwarvish",
      acolyte,
    );
    expect(second).toEqual({
      ok: true,
      next: ["common", "elvish", "dwarvish"],
    });

    const blocked = toggleLanguageSelection(
      ["common", "elvish", "dwarvish"],
      "orc",
      acolyte,
    );
    expect(blocked.ok).toBe(false);
  });

  it("locks granted languages", () => {
    const result = toggleLanguageSelection(["common"], "common", acolyte);
    expect(result.ok).toBe(false);
  });

  it("syncs selection when background grant changes", () => {
    expect(
      syncLanguagesForBackground(
        ["common", "elvish", "dwarvish", "orc"],
        acolyte,
      ),
    ).toEqual(["common", "elvish", "dwarvish"]);
  });
});
