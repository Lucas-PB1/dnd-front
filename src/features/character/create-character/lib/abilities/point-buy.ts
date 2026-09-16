import type { AbilityGenerationMethod } from "@/entities/ability-generation-method/types";
import { ABILITY_SCORE_KEYS } from "@/entities/character/lib/ability-score-keys";
import type { AbilityScores } from "@/entities/character/types";

export type PointBuyRules = {
  budget: number;
  minScore: number;
  maxScore: number;
  costByScore: Record<number, number>;
};

export const ABILITY_KEYS = ABILITY_SCORE_KEYS;

export function parsePointBuyRules(
  method: AbilityGenerationMethod | undefined,
): PointBuyRules | null {
  const source = method?.pointBuy;
  if (!source) return null;
  const costByScore: Record<number, number> = {};
  for (const [score, cost] of Object.entries(source.costByScore)) {
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || typeof cost !== "number") continue;
    costByScore[numericScore] = cost;
  }
  if (Object.keys(costByScore).length === 0) return null;
  return {
    budget: source.budget,
    minScore: source.minScore,
    maxScore: source.maxScore,
    costByScore,
  };
}

export function pointBuyScoreOptions(rules: PointBuyRules): number[] {
  return Object.keys(rules.costByScore)
    .map(Number)
    .sort((left, right) => left - right);
}

export function defaultPointBuyScores(rules: PointBuyRules): AbilityScores {
  return Object.fromEntries(
    ABILITY_SCORE_KEYS.map((key) => [key, rules.minScore]),
  ) as AbilityScores;
}

export function pointBuySpent(
  scores: AbilityScores,
  rules: PointBuyRules,
): number {
  return ABILITY_SCORE_KEYS.reduce(
    (sum, key) => sum + (rules.costByScore[scores[key]] ?? 0),
    0,
  );
}

export function pointBuyRemaining(
  scores: AbilityScores,
  rules: PointBuyRules,
): number {
  return rules.budget - pointBuySpent(scores, rules);
}

export function isPointBuyValid(
  scores: AbilityScores,
  rules: PointBuyRules,
): boolean {
  const inRange = ABILITY_SCORE_KEYS.every((key) => {
    const score = scores[key];
    return score >= rules.minScore && score <= rules.maxScore;
  });
  return inRange && pointBuySpent(scores, rules) === rules.budget;
}

export function pointBuyAffordableOptions(
  scores: AbilityScores,
  key: keyof AbilityScores,
  rules: PointBuyRules,
): number[] {
  const current = scores[key];
  const spentOthers =
    pointBuySpent(scores, rules) - (rules.costByScore[current] ?? 0);
  return pointBuyScoreOptions(rules).filter((score) => {
    if (score === current) return true;
    return spentOthers + (rules.costByScore[score] ?? 0) <= rules.budget;
  });
}

export function formatPointBuyOptionLabel(
  score: number,
  rules: PointBuyRules,
): string {
  const cost = rules.costByScore[score] ?? 0;
  return `${score} · ${cost} pts`;
}
