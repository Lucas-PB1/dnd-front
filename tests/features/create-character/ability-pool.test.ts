import { describe, expect, it } from "vitest";

import type { AbilityScores } from "@/entities/character/types";
import {
  formatPoolOptionLabel,
  isAbilityPoolAssigned,
  poolOptionsWithCounts,
  remainingPoolForAbility,
  removeOneOccurrence,
  UNASSIGNED_ABILITY_SCORES,
} from "@/features/create-character/lib/ability-pool";

const scores = (partial: Partial<AbilityScores>): AbilityScores => ({
  ...UNASSIGNED_ABILITY_SCORES,
  ...partial,
});

describe("ability-pool", () => {
  it("removeOneOccurrence removes a single duplicate", () => {
    expect(removeOneOccurrence([12, 12, 12], 12)).toEqual([12, 12]);
  });

  it("remainingPoolForAbility keeps multiplicity for the current ability", () => {
    const pool = [12, 12, 12, 14, 10, 8];
    const remaining = remainingPoolForAbility(
      pool,
      scores({ forca: 12, destreza: 12 }),
      "constituicao",
    );
    expect(poolOptionsWithCounts(remaining)).toEqual([
      { value: 14, count: 1 },
      { value: 12, count: 1 },
      { value: 10, count: 1 },
      { value: 8, count: 1 },
    ]);
  });

  it("formatPoolOptionLabel shows multiplicity", () => {
    expect(formatPoolOptionLabel({ value: 12, count: 3 })).toBe("12 (3x)");
    expect(formatPoolOptionLabel({ value: 15, count: 1 })).toBe("15");
  });

  it("isAbilityPoolAssigned requires exact multiset match", () => {
    const pool = [15, 14, 13, 12, 10, 8];
    expect(isAbilityPoolAssigned(pool, UNASSIGNED_ABILITY_SCORES)).toBe(false);
    expect(
      isAbilityPoolAssigned(
        pool,
        scores({
          forca: 15,
          destreza: 14,
          constituicao: 13,
          inteligencia: 12,
          sabedoria: 10,
          carisma: 8,
        }),
      ),
    ).toBe(true);
    expect(
      isAbilityPoolAssigned(
        pool,
        scores({
          forca: 15,
          destreza: 15,
          constituicao: 13,
          inteligencia: 12,
          sabedoria: 10,
          carisma: 8,
        }),
      ),
    ).toBe(false);
  });
});
