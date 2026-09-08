import { describe, expect, it } from "vitest";

import { resolveLevelUpSubclassOptionSlots } from "@/features/character/character-sheet/lib/level-up/unlock-subclass-option-slots";

describe("resolveLevelUpSubclassOptionSlots", () => {
  it("prefers preview slots when present", () => {
    const previewSlots = [
      { optionKey: "fromPreview", label: "Preview", unlockLevel: 6 },
    ];
    expect(
      resolveLevelUpSubclassOptionSlots({
        previewSlots,
        subclassRequired: true,
        draftSubclassSlug: "wild-heart",
        draftOptionGroups: [
          {
            optionKey: "wildRageAspect",
            label: "Aspecto",
            unlockLevel: 3,
            valueType: "catalog",
            values: [],
          },
        ],
        nextLevel: 3,
      }),
    ).toEqual(previewSlots);
  });

  it("uses draft unlock options when preview is empty at subclass unlock", () => {
    expect(
      resolveLevelUpSubclassOptionSlots({
        previewSlots: [],
        subclassRequired: true,
        draftSubclassSlug: "wild-heart",
        draftOptionGroups: [
          {
            optionKey: "wildRageAspect",
            label: "Aspecto",
            unlockLevel: 3,
            valueType: "catalog",
            values: [],
          },
          {
            optionKey: "laterPick",
            label: "Depois",
            unlockLevel: 6,
            valueType: "catalog",
            values: [],
          },
        ],
        nextLevel: 3,
      }),
    ).toEqual([
      {
        optionKey: "wildRageAspect",
        label: "Aspecto",
        unlockLevel: 3,
      },
    ]);
  });

  it("returns empty when subclass not required or not chosen", () => {
    expect(
      resolveLevelUpSubclassOptionSlots({
        previewSlots: [],
        subclassRequired: false,
        draftSubclassSlug: "berserker",
        draftOptionGroups: [],
        nextLevel: 3,
      }),
    ).toEqual([]);
    expect(
      resolveLevelUpSubclassOptionSlots({
        previewSlots: [],
        subclassRequired: true,
        draftSubclassSlug: "",
        draftOptionGroups: [
          {
            optionKey: "wildRageAspect",
            label: "Aspecto",
            unlockLevel: 3,
            valueType: "catalog",
            values: [],
          },
        ],
        nextLevel: 3,
      }),
    ).toEqual([]);
  });
});
