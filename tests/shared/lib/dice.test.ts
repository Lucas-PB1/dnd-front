import { describe, expect, it } from "vitest";

import {
  collectActionRollTargets,
  extractDiceExpressions,
  normalizeDiceExpression,
  parseDiceExpression,
  rollD20Check,
  rollExpression,
} from "@/shared/lib/dice";

describe("extractDiceExpressions", () => {
  it("extrai dados compostos de prosa PHB", () => {
    expect(
      extractDiceExpressions(
        "15 (2d8 + 6) dano Perfurante mais 11 (2d10) dano Venenoso",
      ),
    ).toEqual(["2d8+6", "2d10"]);
  });

  it("deduplica expressões iguais", () => {
    expect(extractDiceExpressions("2d6 e mais 2d6")).toEqual(["2d6"]);
  });
});

describe("parseDiceExpression", () => {
  it("aceita espaços e normaliza", () => {
    expect(parseDiceExpression("2d8 + 6")).toEqual({
      count: 2,
      sides: 8,
      modifier: 6,
    });
    expect(normalizeDiceExpression("2d8 - 1")).toBe("2d8-1");
  });
});

describe("rolls", () => {
  it("rola expressão determinística", () => {
    const result = rollExpression("2d6+3", "Dano", { rng: () => 0 });
    expect(result.total).toBe(5);
    expect(result.rolls).toEqual([1, 1]);
    expect(result.expression).toBe("2d6+3");
  });

  it("rola dano crítico dobrando dados", () => {
    const result = rollExpression("2d6+3", "Dano", {
      critical: true,
      rng: () => 0,
    });
    expect(result.critical).toBe(true);
    expect(result.rolls).toEqual([1, 1, 1, 1]);
    expect(result.expression).toBe("4d6+3");
    expect(result.total).toBe(7);
    expect(result.label).toContain("crítico");
  });

  it("rola ataque d20+mod", () => {
    const result = rollD20Check(10, "Ataque", "normal", () => 0.999);
    expect(result.total).toBe(30);
    expect(result.expression).toBe("1d20+10");
  });

  it("rola ataque com vantagem", () => {
    let call = 0;
    const result = rollD20Check(5, "Ataque", "advantage", () => {
      call += 1;
      return call === 1 ? 0 : 0.999;
    });
    expect(result.rolls).toEqual([1, 20]);
    expect(result.kept).toEqual([20]);
    expect(result.total).toBe(25);
    expect(result.expression).toContain("vantagem");
  });
});

describe("collectActionRollTargets", () => {
  it("monta ataque e danos da ação", () => {
    const targets = collectActionRollTargets({
      name: "Mordida",
      attackBonus: 10,
      damageExpression:
        "15 (2d8 + 6) dano Perfurante mais 11 (2d10) dano Venenoso",
      description:
        "Teste de ataque corpo a corpo: +10, alcance 3 m Acerto: 15 (2d8 + 6) dano Perfurante mais 11 (2d10) dano Venenoso.",
    });
    expect(targets).toEqual([
      { kind: "attack", label: "Ataque · Mordida", modifier: 10 },
      {
        kind: "damage",
        label: "Dano · Mordida",
        expression: "2d8+6",
      },
      {
        kind: "damage",
        label: "Dano · Mordida",
        expression: "2d10",
      },
    ]);
  });
});
