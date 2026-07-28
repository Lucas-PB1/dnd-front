import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_KEYS } from "@/features/character/create-character/lib/abilities/point-buy";

/** Score 0 = ainda não atribuído no pool (standard-array / roll). */
export const UNASSIGNED_ABILITY_SCORES: AbilityScores = {
  forca: 0,
  destreza: 0,
  constituicao: 0,
  inteligencia: 0,
  sabedoria: 0,
  carisma: 0,
};

export const STANDARD_ARRAY_VALUES = [15, 14, 13, 12, 10, 8] as const;

export function removeOneOccurrence(values: number[], value: number): number[] {
  const index = values.indexOf(value);
  if (index < 0) return values;
  return [...values.slice(0, index), ...values.slice(index + 1)];
}

/** Valores ainda disponíveis para um atributo (inclui o que ele já tem). */
export function remainingPoolForAbility(
  pool: number[],
  scores: AbilityScores,
  ability: keyof AbilityScores,
): number[] {
  let remaining = [...pool];
  for (const key of ABILITY_KEYS) {
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
  if (pool.length !== ABILITY_KEYS.length) return false;
  let remaining = [...pool];
  for (const key of ABILITY_KEYS) {
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
