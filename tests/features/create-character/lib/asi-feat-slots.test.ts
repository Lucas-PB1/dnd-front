import { describe, expect, it } from "vitest";

import {
  ASI_FEAT_LEVELS,
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/create-character/lib/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import { previewCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";

describe("asi-feat-slots", () => {
  it("counts slots up to character level", () => {
    expect(countAsiFeatSlots(1)).toBe(0);
    expect(countAsiFeatSlots(4)).toBe(1);
    expect(countAsiFeatSlots(5)).toBe(1);
    expect(countAsiFeatSlots(8)).toBe(2);
    expect(countAsiFeatSlots(20)).toBe(ASI_FEAT_LEVELS.length);
  });

  it("lists ASI levels reached", () => {
    expect(asiFeatLevelsUpTo(7)).toEqual([4]);
    expect(asiFeatLevelsUpTo(12)).toEqual([4, 8, 12]);
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

describe("previewCreateCharacterFeats", () => {
  it("injects background origin when missing from ASI picks", () => {
    expect(
      previewCreateCharacterFeats("skilled", [
        { featSlug: "alert", instanceIndex: 0 },
      ]),
    ).toEqual([
      { featSlug: "skilled", instanceIndex: 0 },
      { featSlug: "alert", instanceIndex: 0 },
    ]);
  });

  it("does not duplicate origin slug already chosen as ASI", () => {
    expect(
      previewCreateCharacterFeats("magic-initiate", [
        { featSlug: "magic-initiate", instanceIndex: 0 },
      ]),
    ).toEqual([{ featSlug: "magic-initiate", instanceIndex: 0 }]);
  });
});
