import { describe, expect, it } from "vitest";

import {
  BASE_ASI_FEAT_LEVELS,
  asiFeatLevelsForClass,
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";

describe("asi-feat-slots", () => {
  it("counts slots up to character level (base classes)", () => {
    expect(countAsiFeatSlots("wizard", 1)).toBe(0);
    expect(countAsiFeatSlots("wizard", 4)).toBe(1);
    expect(countAsiFeatSlots("wizard", 5)).toBe(1);
    expect(countAsiFeatSlots("wizard", 8)).toBe(2);
    expect(countAsiFeatSlots("wizard", 20)).toBe(BASE_ASI_FEAT_LEVELS.length);
  });

  it("lists ASI levels reached", () => {
    expect(asiFeatLevelsUpTo("wizard", 7)).toEqual([4]);
    expect(asiFeatLevelsUpTo("wizard", 12)).toEqual([4, 8, 12]);
  });

  it("includes Fighter extra ASI at 6 and 14", () => {
    expect(asiFeatLevelsForClass("fighter")).toEqual([
      4, 6, 8, 12, 14, 16, 19,
    ]);
    expect(countAsiFeatSlots("fighter", 6)).toBe(2);
    expect(asiFeatLevelsUpTo("fighter", 14)).toEqual([4, 6, 8, 12, 14]);
  });

  it("includes Rogue extra ASI at 10", () => {
    expect(asiFeatLevelsForClass("rogue")).toEqual([4, 8, 10, 12, 16, 19]);
    expect(countAsiFeatSlots("rogue", 10)).toBe(3);
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
