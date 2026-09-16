import { ABILITY_SCORE_KEYS } from "@/entities/character/lib/ability-score-keys";
import type { AbilityScores } from "@/entities/character/types";

export const UNASSIGNED_ABILITY_SCORES: AbilityScores = {
  forca: 0,
  destreza: 0,
  constituicao: 0,
  inteligencia: 0,
  sabedoria: 0,
  carisma: 0,
};

export function removeOneOccurrence(values: number[], value: number): number[] {
  const index = values.indexOf(value);
  if (index < 0) return values;
  return [...values.slice(0, index), ...values.slice(index + 1)];
}

export function remainingPoolForAbility(
  pool: number[],
  scores: AbilityScores,
  ability: keyof AbilityScores,
): number[] {
  let remaining = [...pool];
  for (const key of ABILITY_SCORE_KEYS) {
    if (key === ability) continue;
    const assigned = scores[key];
    if (assigned > 0) {
      remaining = removeOneOccurrence(remaining, assigned);
    }
  }
  return remaining.sort((a, b) => b - a);
}

export type PoolOption = {
  value: number;
  count: number;
};

export function poolOptionsWithCounts(remaining: number[]): PoolOption[] {
  const counts = new Map<number, number>();
  for (const value of remaining) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([value, count]) => ({ value, count }));
}

export function formatPoolOptionLabel(option: PoolOption): string {
  return option.count > 1 ? `${option.value} (${option.count}x)` : String(option.value);
}

export function isAbilityPoolAssigned(
  pool: number[],
  scores: AbilityScores,
): boolean {
  if (pool.length !== ABILITY_SCORE_KEYS.length) return false;
  let remaining = [...pool];
  for (const key of ABILITY_SCORE_KEYS) {
    const assigned = scores[key];
    if (assigned <= 0) return false;
    const next = removeOneOccurrence(remaining, assigned);
    if (next.length === remaining.length) return false;
    remaining = next;
  }
  return remaining.length === 0;
}

export function sumAbilityValues(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}
