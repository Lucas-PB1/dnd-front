import { describe, expect, it } from "vitest";

import { sessionCombatStatusLines } from "@/features/character/character-sheet/lib/combat/session-combat-status";
import type { CharacterState } from "@/entities/character/session-types";

function baseState(
  overrides: Partial<CharacterState> = {},
): CharacterState {
  return {
    spellSlotsMax: {},
    spellSlotsUsed: {},
    spellSlotsRemaining: {},
    classResources: [],
    concentratingOn: null,
    conditions: [],
    tempHp: 0,
    hitPointsCurrent: 10,
    hitPointsMax: 10,
    hitDiceCurrent: 1,
    hitDiceMax: 1,
    hitDie: "d10",
    deathSaveSuccesses: 0,
    deathSaveFailures: 0,
    inspiration: false,
    wildShapeActive: false,
    wildShapeTemplateSlug: null,
    wildShapeKnownSlugs: [],
    wildShapeFormSwapAvailable: true,
    wildShapeActorId: null,
    companions: [],
    ...overrides,
  };
}

describe("sessionCombatStatusLines", () => {
  it("returns empty when state is missing", () => {
    expect(sessionCombatStatusLines(undefined)).toEqual([]);
  });

  it("lists only active session combat flags", () => {
    expect(
      sessionCombatStatusLines(
        baseState({
          rageActive: true,
          sacredWeaponActive: true,
          skinriderTranceActive: true,
        }),
      ).map((line) => line.id),
    ).toEqual(["rage", "sacred-weapon", "skinrider-trance"]);
  });
});
