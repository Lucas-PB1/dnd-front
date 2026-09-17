import { describe, expect, it } from "vitest";

import {
  resolveSkirmishAttackPayloadSchema,
  skirmishAttackResultSchema,
  skirmishDetailSchema,
} from "@/features/skirmish/skirmishes/api/skirmishes.schema";

const ids = {
  skirmish: "11111111-1111-4111-8111-111111111111",
  character: "22222222-2222-4222-8222-222222222222",
  pc: "33333333-3333-4333-8333-333333333333",
  actor: "44444444-4444-4444-8444-444444444444",
  actorEntity: "55555555-5555-4555-8555-555555555555",
};

describe("resolveSkirmishAttackPayloadSchema", () => {
  it("accepts the encounter-shaped attack DTO", () => {
    const parsed = resolveSkirmishAttackPayloadSchema.parse({
      attackerCombatantId: ids.pc,
      targetCombatantId: ids.actor,
      advantage: "advantage",
      itemSlug: "longsword",
      mode: "melee",
      sneakAttack: true,
    });
    expect(parsed.itemSlug).toBe("longsword");
    expect(parsed.mode).toBe("melee");
    expect(parsed.sneakAttack).toBe(true);
  });

  it("rejects a missing attacker id", () => {
    const result = resolveSkirmishAttackPayloadSchema.safeParse({
      targetCombatantId: ids.actor,
    });
    expect(result.success).toBe(false);
  });
});

describe("skirmishAttackResultSchema", () => {
  it("parses a resolved attack payload from the API", () => {
    const parsed = skirmishAttackResultSchema.parse({
      skirmish: {
        id: ids.skirmish,
        status: "active",
        characterId: ids.character,
        characterName: "Aldric",
        opponentName: "Goblin",
        round: 1,
        winnerKind: null,
        createdAt: "2026-09-17T00:00:00.000Z",
        updatedAt: "2026-09-17T00:00:00.000Z",
        combatants: [
          {
            id: ids.pc,
            kind: "pc",
            characterId: ids.character,
            actorId: null,
            displayName: "Aldric",
            initiativeTotal: 14,
            initiativeModifier: 2,
            sortOrder: 0,
            isActive: true,
            isCurrentTurn: true,
            armorClass: 16,
            hpCurrent: 22,
            hpMax: 22,
            conditions: [],
          },
          {
            id: ids.actor,
            kind: "actor",
            characterId: null,
            actorId: ids.actorEntity,
            displayName: "Goblin",
            initiativeTotal: 12,
            initiativeModifier: 2,
            sortOrder: 1,
            isActive: true,
            isCurrentTurn: false,
            armorClass: 15,
            hpCurrent: 7,
            hpMax: 7,
            conditions: [],
          },
        ],
        currentCombatantId: ids.pc,
        myTurn: true,
        turnAttacksRemaining: 1,
        myWeapons: [{ itemSlug: "longsword", mode: "melee" }],
        mySpells: [],
        fighter: null,
        combatLog: [{ at: "2026-09-17T00:00:00.000Z", text: "Início" }],
      },
      hit: true,
      critical: false,
      attackTotal: 18,
      attackExpression: "1d20+5",
      attackRolls: [13],
      targetAc: 15,
      damageTotal: 9,
      damageExpression: "1d8+3",
      note: "Acerto",
      attackerCombatantId: ids.pc,
      targetCombatantId: ids.actor,
    });
    expect(parsed.hit).toBe(true);
    expect(parsed.skirmish.combatants).toHaveLength(2);
  });
});

describe("skirmishDetailSchema", () => {
  it("rejects an invalid status", () => {
    const result = skirmishDetailSchema.safeParse({
      id: ids.skirmish,
      status: "open",
      characterId: ids.character,
      characterName: "Aldric",
      opponentName: null,
      round: 1,
      winnerKind: null,
      createdAt: "2026-09-17T00:00:00.000Z",
      updatedAt: "2026-09-17T00:00:00.000Z",
      combatants: [],
      currentCombatantId: null,
      myTurn: false,
      myWeapons: [],
      combatLog: [],
    });
    expect(result.success).toBe(false);
  });
});
