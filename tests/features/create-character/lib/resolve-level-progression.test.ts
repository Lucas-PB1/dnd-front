import { describe, expect, it } from "vitest";

import { resolveLevelProgression } from "@/features/create-character/lib/resolve-level-progression";

describe("resolveLevelProgression", () => {
  it("falls back to spell-slots row", () => {
    const row = resolveLevelProgression(1, undefined, {
      classLevel: 1,
      patternSlug: "full",
      patternName: "Completo",
      proficiencyBonus: 2,
      cantrips: 4,
      preparedSpells: 2,
      channelDivinity: null,
      spellSlots: { "1": 2 },
    });
    expect(row?.preparedSpells).toBe(2);
    expect(row?.cantrips).toBe(4);
  });
});
