import type { ClassProgressionRow } from "@/entities/class/types";

export function asiFeatLevelsFromProgression(
  rows: readonly Pick<ClassProgressionRow, "level" | "asiOrFeat">[],
): number[] {
  return rows
    .filter((row) => row.asiOrFeat)
    .map((row) => row.level)
    .sort((left, right) => left - right);
}

export function countAsiFeatSlots(
  rows: readonly Pick<ClassProgressionRow, "level" | "asiOrFeat">[],
  level: number,
): number {
  return asiFeatLevelsFromProgression(rows).filter((asiLevel) => asiLevel <= level)
    .length;
}

export function asiFeatLevelsUpTo(
  rows: readonly Pick<ClassProgressionRow, "level" | "asiOrFeat">[],
  level: number,
): number[] {
  return asiFeatLevelsFromProgression(rows).filter(
    (asiLevel) => asiLevel <= level,
  );
}
