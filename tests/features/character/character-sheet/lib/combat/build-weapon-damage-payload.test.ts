import { describe, expect, it } from "vitest";

import { buildWeaponDamagePayload } from "@/features/character/character-sheet/lib/combat/build-weapon-damage-payload";

describe("buildWeaponDamagePayload", () => {
  it("builds a shared damage payload with sneak and ranger options", () => {
    expect(
      buildWeaponDamagePayload({
        itemSlug: "rapier",
        mode: "melee",
        sneakAttack: true,
        cunningStrikeEffects: ["trip"],
        poisonousSneak: true,
        huntersMark: true,
        colossusSlayer: true,
      }),
    ).toEqual({
      itemSlug: "rapier",
      mode: "melee",
      sneakAttack: true,
      cunningStrikeEffects: ["trip"],
      poisonousSneak: true,
      huntersMark: true,
      colossusSlayer: true,
    });
  });

  it("adds critical without duplicating unrelated flags", () => {
    expect(
      buildWeaponDamagePayload({
        itemSlug: "rapier",
        mode: "melee",
        critical: true,
        sneakAttack: true,
        assassinDeathStrike: true,
      }),
    ).toEqual({
      itemSlug: "rapier",
      mode: "melee",
      critical: true,
      sneakAttack: true,
      assassinDeathStrike: true,
    });
  });

  it("omits sneak-linked options when sneak is off", () => {
    expect(
      buildWeaponDamagePayload({
        itemSlug: "rapier",
        mode: "melee",
        sneakAttack: false,
        cunningStrikeEffects: ["trip"],
        assassinDeathStrike: true,
      }),
    ).toEqual({
      itemSlug: "rapier",
      mode: "melee",
    });
  });

  it("includes Cleric Divine Strike when selected", () => {
    expect(
      buildWeaponDamagePayload({
        itemSlug: "mace",
        mode: "melee",
        divineStrike: true,
      }),
    ).toEqual({
      itemSlug: "mace",
      mode: "melee",
      divineStrike: true,
    });
  });
});
