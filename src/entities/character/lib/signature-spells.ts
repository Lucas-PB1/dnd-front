/**
 * Espelha dnd-api `signature-spells.ts`.
 */

export const SIGNATURE_SPELL_1_KEY = "signatureSpell1";
export const SIGNATURE_SPELL_2_KEY = "signatureSpell2";
export const SIGNATURE_SPELL_UNLOCK_LEVEL = 20;
export const SIGNATURE_SPELL_LEVEL = 3;

export const SIGNATURE_SPELL_KEYS = [
  SIGNATURE_SPELL_1_KEY,
  SIGNATURE_SPELL_2_KEY,
] as const;

export function isSignatureSpellOptionKey(optionKey: string): boolean {
  return (
    optionKey === SIGNATURE_SPELL_1_KEY || optionKey === SIGNATURE_SPELL_2_KEY
  );
}

export function signatureSpellKeysAtLevel(level: number): string[] {
  return level >= SIGNATURE_SPELL_UNLOCK_LEVEL ? [...SIGNATURE_SPELL_KEYS] : [];
}
