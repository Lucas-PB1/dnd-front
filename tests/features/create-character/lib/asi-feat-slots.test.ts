import { describe, expect, it } from "vitest";

import {
  asiFeatLevelsFromProgression,
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { featSlugsGrantedOutsideSpecies } from "@/features/character/create-character/lib/feats/origin-feat-options";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";

const BASE_ASI = [4, 8, 12, 16, 19].map((level) => ({
  level,
  asiOrFeat: true,
}));

const FIGHTER_ASI = [4, 6, 8, 12, 14, 16, 19].map((level) => ({
  level,
  asiOrFeat: true,
}));

const ROGUE_ASI = [4, 8, 10, 12, 16, 19].map((level) => ({
  level,
  asiOrFeat: true,
}));

describe("asi-feat-slots", () => {
  it("counts slots up to character level from progression rows", () => {
    expect(countAsiFeatSlots(BASE_ASI, 1)).toBe(0);
    expect(countAsiFeatSlots(BASE_ASI, 4)).toBe(1);
    expect(countAsiFeatSlots(BASE_ASI, 5)).toBe(1);
    expect(countAsiFeatSlots(BASE_ASI, 8)).toBe(2);
    expect(countAsiFeatSlots(BASE_ASI, 20)).toBe(BASE_ASI.length);
  });

  it("lists ASI levels reached", () => {
    expect(asiFeatLevelsUpTo(BASE_ASI, 7)).toEqual([4]);
    expect(asiFeatLevelsUpTo(BASE_ASI, 12)).toEqual([4, 8, 12]);
  });

  it("includes Fighter extra ASI at 6 and 14", () => {
    expect(asiFeatLevelsFromProgression(FIGHTER_ASI)).toEqual([
      4, 6, 8, 12, 14, 16, 19,
    ]);
    expect(countAsiFeatSlots(FIGHTER_ASI, 6)).toBe(2);
    expect(asiFeatLevelsUpTo(FIGHTER_ASI, 14)).toEqual([4, 6, 8, 12, 14]);
  });

  it("includes Rogue extra ASI at 10", () => {
    expect(asiFeatLevelsFromProgression(ROGUE_ASI)).toEqual([
      4, 8, 10, 12, 16, 19,
    ]);
    expect(countAsiFeatSlots(ROGUE_ASI, 10)).toBe(3);
  });
});

describe("asiFeatSlotsToCharacterFeats", () => {
  it("skips empty slots and assigns instance indices", () => {
    expect(asiFeatSlotsToCharacterFeats(["alert", ""])).toEqual([
      { featSlug: "alert", instanceIndex: 0 },
    ]);
    expect(
      asiFeatSlotsToCharacterFeats(["magic-initiate", "magic-initiate"]),
    ).toEqual([
      { featSlug: "magic-initiate", instanceIndex: 0 },
      { featSlug: "magic-initiate", instanceIndex: 1 },
    ]);
  });
});

describe("resolveCreateCharacterFeats", () => {
  it("injects background origin when missing from ASI picks", () => {
    expect(
      resolveCreateCharacterFeats("skilled", [
        { featSlug: "alert", instanceIndex: 0 },
      ]),
    ).toEqual([
      { featSlug: "skilled", instanceIndex: 0 },
      { featSlug: "alert", instanceIndex: 0 },
    ]);
  });

  it("does not duplicate origin slug already chosen as ASI", () => {
    expect(
      resolveCreateCharacterFeats("magic-initiate", [
        { featSlug: "magic-initiate", instanceIndex: 0 },
      ]),
    ).toEqual([{ featSlug: "magic-initiate", instanceIndex: 0 }]);
  });
});

describe("featSlugsGrantedOutsideSpecies", () => {
  it("inclui o talento de origem do antecedente e os marcos ASI", () => {
    expect(
      featSlugsGrantedOutsideSpecies({
        backgroundOriginFeatSlug: "tough",
        asiFeatSlotSlugs: ["alert", ""],
      }),
    ).toEqual(new Set(["tough", "alert"]));
  });

  it("mantém a seleção atual da espécie disponível no campo", () => {
    expect(
      featSlugsGrantedOutsideSpecies({
        backgroundOriginFeatSlug: "tough",
        asiFeatSlotSlugs: [],
        selectedOriginFeatSlug: "tough",
      }),
    ).toEqual(new Set());
  });
});
