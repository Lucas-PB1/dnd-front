import type { Ability } from "@/domain/character-sheet/constants";
import { ABILITIES } from "@/domain/character-sheet/constants";

/** Livro do Jogador 2024 (PT-BR) — Cap. 2, p. 38: Conjunto Padrão */
export const STANDARD_ABILITY_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const STANDARD_ABILITY_ARRAY_TOTAL = STANDARD_ABILITY_ARRAY.reduce(
  (sum, value) => sum + value,
  0,
);

/** Soma típica da rolagem 4d6 (descartar menor) — PHB 2024 */
export const ROLL_ABILITY_SUM_MIN = 72;
export const ROLL_ABILITY_SUM_MAX = 80;

/** Custo de Pontos — PHB 2024 */
export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN_SCORE = 8;
export const POINT_BUY_MAX_SCORE = 15;

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export type AbilityScores = Record<Ability, number>;

export type AbilityScoreMethod = "pointBuy" | "roll" | "standardArray";

export type AbilityRollDetail = {
  value: number;
  dice: [number, number, number, number];
  dropped: number;
};

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function roll4d6DropLowest(): AbilityRollDetail {
  const dice: [number, number, number, number] = [
    rollDie(6),
    rollDie(6),
    rollDie(6),
    rollDie(6),
  ];
  const sorted = [...dice].sort((left, right) => left - right);
  const dropped = sorted[0];
  const value = sorted[1] + sorted[2] + sorted[3];

  return { value, dice, dropped };
}

export function rollSixAbilities(): AbilityRollDetail[] {
  return ABILITIES.map(() => roll4d6DropLowest());
}

export function sumAbilityScores(scores: AbilityScores): number {
  return ABILITIES.reduce((sum, ability) => sum + scores[ability], 0);
}

export function sumRollPool(pool: number[]): number {
  return pool.reduce((sum, value) => sum + value, 0);
}

export function isRollSumInRange(total: number): boolean {
  return total >= ROLL_ABILITY_SUM_MIN && total <= ROLL_ABILITY_SUM_MAX;
}

export function getPointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? 0;
}

export function getPointBuyTotalSpent(scores: AbilityScores): number {
  return ABILITIES.reduce(
    (sum, ability) => sum + getPointBuyCost(scores[ability]),
    0,
  );
}

export function getPointBuyRemaining(scores: AbilityScores): number {
  return POINT_BUY_TOTAL - getPointBuyTotalSpent(scores);
}

export function canIncreasePointBuy(
  scores: AbilityScores,
  ability: Ability,
): boolean {
  const current = scores[ability];
  if (current >= POINT_BUY_MAX_SCORE) {
    return false;
  }

  const costDelta = getPointBuyCost(current + 1) - getPointBuyCost(current);
  return getPointBuyRemaining(scores) >= costDelta;
}

export function canDecreasePointBuy(
  scores: AbilityScores,
  ability: Ability,
): boolean {
  return scores[ability] > POINT_BUY_MIN_SCORE;
}

export function increasePointBuy(
  scores: AbilityScores,
  ability: Ability,
): AbilityScores | null {
  if (!canIncreasePointBuy(scores, ability)) {
    return null;
  }

  return { ...scores, [ability]: scores[ability] + 1 };
}

export function decreasePointBuy(
  scores: AbilityScores,
  ability: Ability,
): AbilityScores | null {
  if (!canDecreasePointBuy(scores, ability)) {
    return null;
  }

  return { ...scores, [ability]: scores[ability] - 1 };
}

export function createDefaultPointBuyScores(): AbilityScores {
  return Object.fromEntries(
    ABILITIES.map((ability) => [ability, POINT_BUY_MIN_SCORE]),
  ) as AbilityScores;
}

export function clampToPointBuyRange(scores: AbilityScores): AbilityScores {
  return Object.fromEntries(
    ABILITIES.map((ability) => [
      ability,
      Math.min(
        POINT_BUY_MAX_SCORE,
        Math.max(POINT_BUY_MIN_SCORE, scores[ability]),
      ),
    ]),
  ) as AbilityScores;
}

export function isPointBuyComplete(scores: AbilityScores): boolean {
  return getPointBuyRemaining(scores) === 0;
}

export function createEmptyAssignment(): Record<Ability, number | null> {
  return Object.fromEntries(
    ABILITIES.map((ability) => [ability, null]),
  ) as Record<Ability, number | null>;
}

export function isAssignmentComplete(
  assigned: Record<Ability, number | null>,
): boolean {
  return ABILITIES.every((ability) => assigned[ability] != null);
}

export function assignmentToScores(
  assigned: Record<Ability, number | null>,
): AbilityScores | null {
  if (!isAssignmentComplete(assigned)) {
    return null;
  }

  return Object.fromEntries(
    ABILITIES.map((ability) => [ability, assigned[ability] as number]),
  ) as AbilityScores;
}

export function abilityAssignmentOptions(
  ability: Ability,
  assigned: Record<Ability, number | null>,
  pool: number[],
): number[] {
  const current = assigned[ability];
  const fromPool = [...new Set(pool)].sort((left, right) => right - left);

  if (current != null && !fromPool.includes(current)) {
    return [current, ...fromPool].sort((left, right) => right - left);
  }

  return fromPool;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifierValue(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}
