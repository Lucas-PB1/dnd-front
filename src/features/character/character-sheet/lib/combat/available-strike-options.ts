import type { StrikeOption } from "@/entities/combat-mechanical/types";
import type { SubclassOption } from "@/entities/character/sheet-types";

export const BLOOD_STRIKE_OPTION_KEY_RE = /^bloodStrike\d+$/;

export function knownStrikeOptionSlugs(
  subclassOptions: readonly SubclassOption[] | undefined,
): string[] {
  if (!subclassOptions) return [];
  return subclassOptions
    .filter((option) => BLOOD_STRIKE_OPTION_KEY_RE.test(option.optionKey))
    .map((option) => option.valueId);
}

export function availableStrikeOptions(
  catalog: readonly StrikeOption[],
  input: {
    subclassSlug?: string | null;
  },
): StrikeOption[] {
  return catalog.filter(
    (option) =>
      !option.subclassSlug || option.subclassSlug === input.subclassSlug,
  );
}

export function strikeOptionSummary(
  option: StrikeOption,
  level: number,
): string {
  const extra =
    level >= 18 ? option.extraDiceL18 : option.extraDice;
  const parts: string[] = [];
  if (option.costDice) parts.push(`custo ${option.costDice}`);
  if (extra && extra !== "0") parts.push(`extra ${extra}`);
  if (option.damageType) parts.push(option.damageType);
  if (option.saveAbility) parts.push(`CD ${option.saveAbility}`);
  if (option.noteOnly) parts.push("nota");
  return parts.join(" · ");
}
