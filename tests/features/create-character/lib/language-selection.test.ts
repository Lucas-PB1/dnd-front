import { describe, expect, it } from "vitest";

import {
  filterPickableLanguages,
  isPickableLanguage,
  languageQuota,
  SPECIES_LANGUAGE_CHOICE_COUNT,
  syncLanguagesForBackground,
  toggleLanguageSelection,
} from "@/features/character/create-character/lib/languages/language-selection";

const legacyAcolyte = {
  grantedSlugs: ["common"],
  languageChoiceCount: 2,
};

const modernBackground = {
  grantedSlugs: ["common"],
  languageChoiceCount: 0,
  speciesSlug: "human",
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

  it("uses background common with explicit choice count", () => {
    expect(languageQuota(legacyAcolyte)).toEqual({
      granted: ["common"],
      choiceCount: 2,
      maxTotal: 3,
      backgroundChoiceCount: 2,
      speciesChoiceCount: 0,
      classChoiceCount: 0,
    });
  });

  it("adds species language choices when speciesSlug is set", () => {
    expect(languageQuota(modernBackground)).toEqual({
      granted: ["common"],
      choiceCount: SPECIES_LANGUAGE_CHOICE_COUNT,
      maxTotal: 1 + SPECIES_LANGUAGE_CHOICE_COUNT,
      backgroundChoiceCount: 0,
      speciesChoiceCount: SPECIES_LANGUAGE_CHOICE_COUNT,
      classChoiceCount: 0,
    });
  });

  it("lets the player pick species extras when BG choice is 0", () => {
    const first = toggleLanguageSelection(
      ["common"],
      "elvish",
      modernBackground,
      standardCatalog,
    );
    expect(first).toEqual({ ok: true, next: ["common", "elvish"] });

    const second = toggleLanguageSelection(
      ["common", "elvish"],
      "dwarvish",
      modernBackground,
      standardCatalog,
    );
    expect(second).toEqual({
      ok: true,
      next: ["common", "elvish", "dwarvish"],
    });

    const blocked = toggleLanguageSelection(
      ["common", "elvish", "dwarvish"],
      "orc",
      modernBackground,
      standardCatalog,
    );
    expect(blocked.ok).toBe(false);
  });

  it("rejects rare languages", () => {
    const result = toggleLanguageSelection(
      ["common"],
      "abyssal",
      modernBackground,
      standardCatalog,
    );
    expect(result.ok).toBe(false);
  });

  it("locks granted languages", () => {
    const result = toggleLanguageSelection(
      ["common"],
      "common",
      modernBackground,
    );
    expect(result.ok).toBe(false);
  });

  it("adds class extra language choices on top of species", () => {
    const rogue = {
      ...modernBackground,
      extraGrantedSlugs: ["thieves-cant"],
      extraChoiceCount: 1,
    };
    expect(languageQuota(rogue)).toEqual({
      granted: ["common", "thieves-cant"],
      choiceCount: SPECIES_LANGUAGE_CHOICE_COUNT + 1,
      maxTotal: 2 + SPECIES_LANGUAGE_CHOICE_COUNT + 1,
      backgroundChoiceCount: 0,
      speciesChoiceCount: SPECIES_LANGUAGE_CHOICE_COUNT,
      classChoiceCount: 1,
    });
  });

  it("locks druidic as a class grant without extra class choices", () => {
    const druid = {
      ...modernBackground,
      extraGrantedSlugs: ["druidic"],
      extraChoiceCount: 0,
    };
    expect(languageQuota(druid)).toEqual({
      granted: ["common", "druidic"],
      choiceCount: SPECIES_LANGUAGE_CHOICE_COUNT,
      maxTotal: 2 + SPECIES_LANGUAGE_CHOICE_COUNT,
      backgroundChoiceCount: 0,
      speciesChoiceCount: SPECIES_LANGUAGE_CHOICE_COUNT,
      classChoiceCount: 0,
    });
    expect(syncLanguagesForBackground(["common", "elvish"], druid)).toEqual([
      "common",
      "druidic",
      "elvish",
    ]);
  });

  it("syncs selection when grant changes", () => {
    expect(
      syncLanguagesForBackground(
        ["common", "elvish", "dwarvish", "orc", "abyssal"],
        modernBackground,
        standardCatalog,
      ),
    ).toEqual(["common", "elvish", "dwarvish"]);
  });

  it("does not invent background choices when input is empty", () => {
    expect(languageQuota(null)).toEqual({
      granted: ["common"],
      choiceCount: 0,
      maxTotal: 1,
      backgroundChoiceCount: 0,
      speciesChoiceCount: 0,
      classChoiceCount: 0,
    });
  });
});
