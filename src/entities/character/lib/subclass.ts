export function isSubclassRequired(
  level: number,
  unlockLevel: number | null | undefined,
): boolean {
  return unlockLevel != null && level >= unlockLevel;
}
