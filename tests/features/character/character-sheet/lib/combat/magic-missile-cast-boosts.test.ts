import { describe, expect, it } from "vitest";

import {
  MAGIC_MISSILE_SPELL_SLUG,
  missileBoostFlagsFromChoice,
  shouldOfferMissileBoostModal,
} from "@/features/character/character-sheet/lib/combat/magic-missile-cast-boosts";

const snapshot = {
  shieldRemaining: 1,
  gigaRemaining: 1,
  shieldArmed: false,
  gigaArmed: false,
};

describe("shouldOfferMissileBoostModal", () => {
  it("offers the modal when a missile mage can still pick a boost", () => {
    expect(
      shouldOfferMissileBoostModal({
        isMissileMage: true,
        spellSlug: MAGIC_MISSILE_SPELL_SLUG,
        snapshot,
      }),
    ).toBe(true);
  });

  it("skips the modal when boosts are already armed or spent", () => {
    expect(
      shouldOfferMissileBoostModal({
        isMissileMage: true,
        spellSlug: MAGIC_MISSILE_SPELL_SLUG,
        snapshot: {
          shieldRemaining: 1,
          gigaRemaining: 0,
          shieldArmed: true,
          gigaArmed: false,
        },
      }),
    ).toBe(false);
    expect(
      shouldOfferMissileBoostModal({
        isMissileMage: false,
        spellSlug: MAGIC_MISSILE_SPELL_SLUG,
        snapshot,
      }),
    ).toBe(false);
    expect(
      shouldOfferMissileBoostModal({
        isMissileMage: true,
        spellSlug: "alarme",
        snapshot,
      }),
    ).toBe(false);
  });
});

describe("missileBoostFlagsFromChoice", () => {
  it("keeps armed boosts even if the checkbox is off", () => {
    expect(
      missileBoostFlagsFromChoice({
        snapshot: {
          shieldRemaining: 1,
          gigaRemaining: 1,
          shieldArmed: true,
          gigaArmed: false,
        },
        applyShield: false,
        applyGiga: true,
      }),
    ).toEqual({ applyMissileShield: true, applyGigaMissile: true });
  });
});
