/**
 * Espelha dnd-api `class-order-effects.ts`.
 */

export const DIVINE_ORDER_KEY = "divineOrder";
export const PRIMAL_ORDER_KEY = "primalOrder";

type ClassOptionLike = { optionKey: string; valueId: string };

function readOrderValue(
  classOptions: readonly ClassOptionLike[] | undefined,
  key: string,
): string | null {
  return (
    classOptions?.find((option) => option.optionKey === key)?.valueId ?? null
  );
}

export function extraCantripsFromClassOrder(
  classOptions: readonly ClassOptionLike[] | undefined,
): number {
  const divine = readOrderValue(classOptions, DIVINE_ORDER_KEY);
  const primal = readOrderValue(classOptions, PRIMAL_ORDER_KEY);
  if (divine === "thaumaturge" || primal === "magician") return 1;
  return 0;
}

export function classOrderSkillCheckBonus(
  skillSlug: string,
  classOptions: readonly ClassOptionLike[] | undefined,
  wisdomModifier: number,
): number {
  const extra = Math.max(wisdomModifier, 1);
  const divine = readOrderValue(classOptions, DIVINE_ORDER_KEY);
  const primal = readOrderValue(classOptions, PRIMAL_ORDER_KEY);
  if (
    divine === "thaumaturge" &&
    (skillSlug === "arcana" || skillSlug === "religion")
  ) {
    return extra;
  }
  if (
    primal === "magician" &&
    (skillSlug === "arcana" || skillSlug === "nature")
  ) {
    return extra;
  }
  return 0;
}
