import { describe, expect, it } from "vitest";

import type { SkirmishAttackResult } from "@/features/skirmish/skirmishes/api/skirmishes.schema";
import {
  skirmishAttackDamageLine,
  skirmishAttackHeadline,
} from "@/features/skirmish/skirmishes/lib/skirmish-attack-outcome";

function result(
  overrides: Partial<SkirmishAttackResult>,
): SkirmishAttackResult {
  return {
    skirmish: {
      id: "11111111-1111-4111-8111-111111111111",
      status: "active",
      characterId: "22222222-2222-4222-8222-222222222222",
      characterName: "Aldric",
      opponentName: "Goblin",
      round: 1,
      winnerKind: null,
      createdAt: "2026-09-17T00:00:00.000Z",
      updatedAt: "2026-09-17T00:00:00.000Z",
      combatants: [],
      currentCombatantId: null,
      myTurn: true,
      turnAttacksRemaining: 1,
      myWeapons: [],
      mySpells: [],
      fighter: null,
      combatLog: [],
    },
    hit: false,
    critical: false,
    attackTotal: 12,
    attackExpression: "1d20+4",
    attackRolls: [8],
    targetAc: 15,
    damageTotal: null,
    damageExpression: null,
    damageRolls: [],
    note: null,
    attackerCombatantId: "33333333-3333-4333-8333-333333333333",
    targetCombatantId: "44444444-4444-4444-8444-444444444444",
    ...overrides,
  };
}

describe("skirmishAttackHeadline", () => {
  it("labels a miss with dice faces", () => {
    expect(skirmishAttackHeadline(result({}))).toBe(
      "Erro — 1d20+4 [8] = 12 vs CA 15",
    );
  });

  it("labels a hit and a crit with dice faces", () => {
    expect(
      skirmishAttackHeadline(
        result({ hit: true, attackTotal: 18, attackRolls: [14] }),
      ),
    ).toBe("Acerto — 1d20+4 [14] = 18 vs CA 15");
    expect(
      skirmishAttackHeadline(
        result({
          hit: true,
          critical: true,
          attackTotal: 24,
          attackRolls: [20],
        }),
      ),
    ).toBe("Crítico — 1d20+4 [20] = 24 vs CA 15");
  });
});

describe("skirmishAttackDamageLine", () => {
  it("is omitted when there is no damage", () => {
    expect(skirmishAttackDamageLine(result({}))).toBeNull();
  });

  it("formats damage with dice faces on a hit", () => {
    expect(
      skirmishAttackDamageLine(
        result({
          hit: true,
          damageTotal: 9,
          damageExpression: "1d8+3",
          damageRolls: [6],
        }),
      ),
    ).toBe("Dano 1d8+3 [6] = 9");
  });
});
