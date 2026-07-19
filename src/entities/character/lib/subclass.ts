export const SUBCLASS_UNLOCK_LEVEL_DEFAULT = 3;

export function isSubclassRequired(
  level: number,
  unlockLevel = SUBCLASS_UNLOCK_LEVEL_DEFAULT,
): boolean {
  return level >= unlockLevel;
}
