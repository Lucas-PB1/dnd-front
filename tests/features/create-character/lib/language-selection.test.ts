import { describe, expect, it } from "vitest";

import {
  filterPickableLanguages,
  isPickableLanguage,
  languageQuota,
  syncLanguagesForBackground,
  toggleLanguageSelection,
} from "@/features/character/create-character/lib/languages/language-selection";

const acolyte = {
  grantedSlugs: ["common"],
  languageChoiceCount: 2,
};

const standardCatalog = [
  { slug: "common", isRare: false },
  { slug: "elvish", isRare: false },
  { slug: "dwarvish", isRare: false },
  { slug: "orc", isRare: false },
  { slug: "abyssal", isRare: true },
  { slug: "druidic", isRare: true },
  { slug: "thieves-cant", isRare: true },
];

describe("language-selection", () => {
  it("filters pickable standard languages", () => {
    expect(filterPickableLanguages(standardCatalog, ["common"])).toEqual([
      { slug: "elvish", isRare: false },
      { slug: "dwarvish", isRare: false },
      { slug: "orc", isRare: false },
    ]);
  });

  it("blocks rare and class-exclusive languages", () => {
    expect(isPickableLanguage("abyssal", { slug: "abyssal", isRare: true })).toBe(
      false,
    );
    expect(isPickableLanguage("druidic", { slug: "druidic", isRare: true })).toBe(
      false,
    );
  });

  it("uses background common + 2 choices by default", () => {
    expect(languageQuota(acolyte)).toEqual({
      granted: ["common"],
      choiceCount: 2,
      maxTotal: 3,
    });
  });

  it("lets the player pick two extra languages", () => {
    const first = toggleLanguageSelection(
      ["common"],
      "elvish",
      acolyte,
      standardCatalog,
    );
    expect(first).toEqual({ ok: true, next: ["common", "elvish"] });

    const second = toggleLanguageSelection(
      ["common", "elvish"],
      "dwarvish",
      acolyte,
      standardCatalog,
    );
    expect(second).toEqual({
      ok: true,
      next: ["common", "elvish", "dwarvish"],
    });

    const blocked = toggleLanguageSelection(
      ["common", "elvish", "dwarvish"],
      "orc",
      acolyte,
      standardCatalog,
    );
    expect(blocked.ok).toBe(false);
  });

  it("rejects rare languages", () => {
    const result = toggleLanguageSelection(
      ["common"],
      "abyssal",
      acolyte,
      standardCatalog,
    );
    expect(result.ok).toBe(false);
  });

  it("locks granted languages", () => {
    const result = toggleLanguageSelection(["common"], "common", acolyte);
    expect(result.ok).toBe(false);
  });

  it("adds class extra language choices", () => {
    const rogue = {
      grantedSlugs: ["common"],
      languageChoiceCount: 2,
      extraGrantedSlugs: ["thieves-cant"],
      extraChoiceCount: 1,
    };
    expect(languageQuota(rogue)).toEqual({
      granted: ["common", "thieves-cant"],
      choiceCount: 3,
      maxTotal: 5,
    });
  });

  it("locks druidic as a class grant without extra choices", () => {
    const druid = {
      grantedSlugs: ["common"],
      languageChoiceCount: 2,
      extraGrantedSlugs: ["druidic"],
      extraChoiceCount: 0,
    };
    expect(languageQuota(druid)).toEqual({
      granted: ["common", "druidic"],
      choiceCount: 2,
      maxTotal: 4,
    });
    expect(syncLanguagesForBackground(["common", "elvish"], druid)).toEqual([
      "common",
      "druidic",
      "elvish",
    ]);
  });

  it("syncs selection when background grant changes", () => {
    expect(
      syncLanguagesForBackground(
        ["common", "elvish", "dwarvish", "orc", "abyssal"],
        acolyte,
        standardCatalog,
      ),
    ).toEqual(["common", "elvish", "dwarvish"]);
  });
});
