import type { AbilityScores } from "@/entities/character/types";

/** Espelha custos PHB — só para feedback de UI; a API valida no POST */
export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export const ABILITY_KEYS: (keyof AbilityScores)[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

export function pointBuySpent(scores: AbilityScores): number {
  return ABILITY_KEYS.reduce(
    (sum, key) => sum + (POINT_BUY_COST[scores[key]] ?? 0),
    0,
  );
}

export function pointBuyRemaining(scores: AbilityScores): number {
  return POINT_BUY_BUDGET - pointBuySpent(scores);
}

export function isPointBuyValid(scores: AbilityScores): boolean {
  const inRange = ABILITY_KEYS.every(
    (key) => scores[key] >= POINT_BUY_MIN && scores[key] <= POINT_BUY_MAX,
  );
  return inRange && pointBuySpent(scores) === POINT_BUY_BUDGET;
}

export const DEFAULT_ABILITY_SCORES: AbilityScores = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

export const POINT_BUY_DEFAULT: AbilityScores = {
  forca: 8,
  destreza: 8,
  constituicao: 8,
  inteligencia: 8,
  sabedoria: 8,
  carisma: 8,
};
