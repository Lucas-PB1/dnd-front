/**
 * Espelha dnd-api `mystic-arcanum.ts`.
 */

export const MYSTIC_ARCANUM_SLOTS = [
  { optionKey: "mysticArcanum6", unlockLevel: 11, spellLevel: 6, label: "6º círculo" },
  { optionKey: "mysticArcanum7", unlockLevel: 13, spellLevel: 7, label: "7º círculo" },
  { optionKey: "mysticArcanum8", unlockLevel: 15, spellLevel: 8, label: "8º círculo" },
  { optionKey: "mysticArcanum9", unlockLevel: 17, spellLevel: 9, label: "9º círculo" },
] as const;

export function mysticArcanumSlotsAtLevel(level: number) {
  return MYSTIC_ARCANUM_SLOTS.filter((slot) => slot.unlockLevel <= level);
}

export function isMysticArcanumOptionKey(optionKey: string): boolean {
  return MYSTIC_ARCANUM_SLOTS.some((slot) => slot.optionKey === optionKey);
}
