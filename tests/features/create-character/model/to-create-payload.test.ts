import { describe, expect, it } from "vitest";

import {
  isPointBuyValid,
  pointBuyRemaining,
  pointBuySpent,
  POINT_BUY_DEFAULT,
} from "@/features/create-character/lib/point-buy";
import { toCreateCharacterPayload } from "@/features/create-character/model/to-create-payload";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";

describe("point-buy helpers", () => {
  it("tracks spent and remaining points", () => {
    expect(pointBuySpent(POINT_BUY_DEFAULT)).toBe(0);
    expect(pointBuyRemaining(POINT_BUY_DEFAULT)).toBe(27);
  });

  it("validates a legal point-buy spread", () => {
    const scores = {
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 8,
    };
    expect(isPointBuyValid(scores)).toBe(true);
  });
});

describe("toCreateCharacterPayload", () => {
  const base: CreateCharacterInput = {
    name: "Thorin",
    level: 5,
    classSlug: "fighter",
    speciesSlug: "dwarf",
    backgroundSlug: "acolyte",
    subclassSlug: "champion",
    abilityGenerationMethodSlug: "standard-array",
    abilityScores: {
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 10,
      sabedoria: 12,
      carisma: 8,
    },
    classSkillSlugs: ["athletics", "perception"],
    abilityRawValues: [15, 14, 13, 12, 10, 8],
    speciesChoices: [],
    subclassOptions: [],
    featOptions: [],
    asiFeatSlotSlugs: [],
    alignmentSlug: "",
    languageSlugs: [],
    equipment: [],
    characterSpells: [],
    backgroundAbilityBoostPlus2Slug: "sabedoria",
    backgroundAbilityBoostPlus1Slug: "carisma",
  };

  it("includes sheet fields and subclass at level 5", () => {
    const payload = toCreateCharacterPayload(base);
    expect(payload.subclassSlug).toBe("champion");
    expect(payload.classSkillSlugs).toEqual(["athletics", "perception"]);
    expect(payload.abilityGenerationMethodSlug).toBe("standard-array");
    expect(payload.backgroundAbilityBoostPlus2Slug).toBe("sabedoria");
    expect(payload.backgroundAbilityBoostPlus1Slug).toBe("carisma");
  });

  it("omits subclass below level 3", () => {
    const payload = toCreateCharacterPayload({
      ...base,
      level: 1,
      subclassSlug: "",
    });
    expect(payload.subclassSlug).toBeUndefined();
  });

  it("includes species choices and equipment when present", () => {
    const payload = toCreateCharacterPayload({
      ...base,
      speciesChoices: [{ choiceKind: "elf_lineage", choiceSlug: "drow" }],
      equipment: [{ source: "class", packageSlug: "a", sortOrder: 0 }],
      characterSpells: [{ spellSlug: "fire-bolt", listType: "known" }],
    });
    expect(payload.speciesChoices).toHaveLength(1);
    expect(payload.equipment).toHaveLength(1);
    expect(payload.characterSpells).toHaveLength(1);
  });

  it("includes ASI feats from slot picks", () => {
    const payload = toCreateCharacterPayload({
      ...base,
      asiFeatSlotSlugs: ["", "alert"],
      featOptions: [],
    });
    expect(payload.characterFeats).toEqual([
      { featSlug: "alert", instanceIndex: 0 },
    ]);
  });
});
