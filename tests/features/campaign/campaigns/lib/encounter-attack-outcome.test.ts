import { describe, expect, it } from "vitest";

import type { EncounterAttackResult } from "@/features/campaign/campaigns/api/encounters.api";
import {
  encounterAttackDamageLine,
  encounterAttackHeadline,
} from "@/features/campaign/campaigns/lib/encounter-attack-outcome";

function result(
  overrides: Partial<EncounterAttackResult>,
): EncounterAttackResult {
  return {
    encounter: {
      id: "e1",
      campaignId: "c1",
      name: "Emboscada",
      status: "active",
      round: 1,
      currentTurnIndex: 0,
      playersCanView: true,
      creatureHpVisibility: "exact",
      currentCombatantId: null,
      currentCharacterId: null,
      combatants: [],
    },
    hit: false,
    critical: false,
    attackTotal: 12,
    attackExpression: "1d20+4",
    attackRolls: [8],
    targetAc: 15,
    damageTotal: null,
    damageExpression: null,
    note: null,
    attackerCombatantId: "a",
    targetCombatantId: "b",
    ...overrides,
  };
}

describe("encounterAttackHeadline", () => {
  it("labels a miss", () => {
    expect(encounterAttackHeadline(result({}))).toBe(
      "Erro — 1d20+4 = 12 vs CA 15",
    );
  });

  it("labels a hit and a crit", () => {
    expect(
      encounterAttackHeadline(result({ hit: true, attackTotal: 18 })),
    ).toBe("Acerto — 1d20+4 = 18 vs CA 15");
    expect(
      encounterAttackHeadline(
        result({ hit: true, critical: true, attackTotal: 24 }),
      ),
    ).toBe("Crítico — 1d20+4 = 24 vs CA 15");
  });
});

describe("encounterAttackDamageLine", () => {
  it("is omitted on a miss", () => {
    expect(encounterAttackDamageLine(result({}))).toBeNull();
  });

  it("formats damage on a hit", () => {
    expect(
      encounterAttackDamageLine(
        result({
          hit: true,
          damageTotal: 9,
          damageExpression: "1d8+3",
        }),
      ),
    ).toBe("Dano 1d8+3 = 9");
  });
});
