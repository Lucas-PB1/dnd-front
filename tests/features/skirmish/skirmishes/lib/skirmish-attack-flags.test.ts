import { describe, expect, it } from "vitest";

import type { WeaponAttackSummary } from "@/entities/character/types";
import {
  availableSkirmishAttackFlagKeys,
  identifiersFromSheetCatalog,
  type SkirmishAttackFlagAvailabilityInput,
} from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";
import { incomingHitFromLogLine } from "@/features/skirmish/skirmishes/lib/skirmish-combat-playback";

function weapon(
  overrides: Partial<WeaponAttackSummary> = {},
): WeaponAttackSummary {
  return {
    itemSlug: "longsword",
    itemName: "Espada Longa",
    mode: "melee",
    attackBonus: 5,
    abilitySlug: "forca",
    proficient: true,
    damageDice: "1d8",
    damageBonus: 3,
    damageType: "slashing",
    attackNote: "",
    damageNote: "1d8+3",
    ...overrides,
  };
}

function flags(
  overrides: Partial<SkirmishAttackFlagAvailabilityInput> = {},
): SkirmishAttackFlagAvailabilityInput {
  return {
    weapon: weapon(),
    inspiration: false,
    featEffectFlags: undefined,
    remainingSpellSlots: [],
    identifiers: [],
    ...overrides,
  };
}

describe("availableSkirmishAttackFlagKeys", () => {
  it("hides riders when the catalog and ficha have none", () => {
    expect(availableSkirmishAttackFlagKeys(flags())).toEqual([]);
  });

  it("shows graze only when the equipped weapon can graze", () => {
    expect(
      availableSkirmishAttackFlagKeys(
        flags({ weapon: weapon({ grazeOnMissDamage: 3 }) }),
      ),
    ).toEqual(["graze"]);
  });

  it("shows sneak attack when the catalog has cunning strikes and the weapon qualifies", () => {
    expect(
      availableSkirmishAttackFlagKeys(
        flags({
          identifiers: identifiersFromSheetCatalog({
            cunningStrikeEffects: [{ slug: "trip" }],
          }),
          weapon: weapon({ sneakAttackEligible: true }),
        }),
      ),
    ).toEqual(["sneakAttack"]);
  });

  it("shows divine smite for paladin via sheet class gate", () => {
    expect(
      availableSkirmishAttackFlagKeys(
        flags({
          remainingSpellSlots: [{ level: 1, remaining: 2 }],
          identifiers: identifiersFromSheetCatalog({
            economyActions: [{ id: "paladin-divine-smite" }],
          }),
        }),
      ),
    ).toEqual(["divineSmite", "smiteVsUndeadOrFiend"]);
  });

  it("shows hunters mark from the economy catalog id", () => {
    expect(
      availableSkirmishAttackFlagKeys(
        flags({
          identifiers: identifiersFromSheetCatalog({
            economyActions: [{ id: "ranger-hunters-mark" }],
          }),
        }),
      ),
    ).toEqual(["huntersMark"]);
  });

  it("shows colossus slayer from the subclass option on the sheet", () => {
    expect(
      availableSkirmishAttackFlagKeys(
        flags({
          identifiers: identifiersFromSheetCatalog({
            subclassOptions: [
              { optionKey: "huntersPrey", valueId: "colossus-slayer" },
            ],
          }),
        }),
      ),
    ).toEqual(["colossusSlayer"]);
  });
});

describe("incomingHitFromLogLine", () => {
  it("detects creature damage against the PC", () => {
    expect(
      incomingHitFromLogLine(
        "Abutre Gigante → E2E Guerreiro: acerto (1d20+4 = 14) · dano 6",
        "Abutre Gigante",
        "E2E Guerreiro",
      ),
    ).toBe(true);
  });

  it("ignores a miss without damage", () => {
    expect(
      incomingHitFromLogLine(
        "Abutre Gigante → E2E Guerreiro: erro (1d20+4 = 8)",
        "Abutre Gigante",
        "E2E Guerreiro",
      ),
    ).toBe(false);
  });
});
