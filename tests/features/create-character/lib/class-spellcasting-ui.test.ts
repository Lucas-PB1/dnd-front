import { describe, expect, it } from "vitest";

import { resolveSpellcastingUiProfile } from "@/features/create-character/lib/class-spellcasting-ui";

describe("class-spellcasting-ui", () => {
  it("customizes cleric copy", () => {
    const profile = resolveSpellcastingUiProfile(
      "cleric",
      "full",
      "prepared",
      {
        level: 1,
        proficiencyBonus: 2,
        cantrips: 3,
        preparedSpells: 4,
        channelDivinity: 0,
      },
    );
    expect(profile.archetypeTitle).toContain("divina");
    expect(profile.showCantripPicker).toBe(true);
    expect(profile.extraResourceLabel).toBeNull();
  });

  it("hides cantrips for ranger at low level", () => {
    const profile = resolveSpellcastingUiProfile(
      "ranger",
      "half",
      "known",
      {
        level: 1,
        proficiencyBonus: 2,
        cantrips: null,
        preparedSpells: 2,
        channelDivinity: null,
      },
    );
    expect(profile.showCantripPicker).toBe(false);
    expect(profile.slotPatternNote).toContain("parcial");
  });

  it("notes warlock pact slots", () => {
    const profile = resolveSpellcastingUiProfile(
      "warlock",
      "pact",
      "known",
      {
        level: 1,
        proficiencyBonus: 2,
        cantrips: 2,
        preparedSpells: 2,
        channelDivinity: null,
      },
    );
    expect(profile.slotPatternNote).toContain("pacto");
  });
});
