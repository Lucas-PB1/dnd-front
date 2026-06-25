import type { Ability } from "@/domain/character-sheet/constants";
import { PHB_2024_BACKGROUND_DETAILS } from "@/domain/character-sheet/data/backgrounds/index";
import type {
  BackgroundAbilityMode,
  BackgroundDefinition,
} from "@/domain/character-sheet/types/background";

export function findBackgroundDetails(
  backgroundId: string,
): BackgroundDefinition | undefined {
  return PHB_2024_BACKGROUND_DETAILS.find((entry) => entry.id === backgroundId);
}

export function getBackgroundAbilityBonuses(
  backgroundId: string,
  mode: BackgroundAbilityMode,
  plus2: string,
  plus1: string,
): Record<Ability, number> {
  const definition = findBackgroundDetails(backgroundId);
  const bonuses = Object.fromEntries(
    (
      [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
      ] as const
    ).map((ability) => [ability, 0]),
  ) as Record<Ability, number>;

  if (!definition) {
    return bonuses;
  }

  if (mode === "even") {
    for (const ability of definition.abilityOptions) {
      bonuses[ability] += 1;
    }
    return bonuses;
  }

  if (
    plus2 &&
    definition.abilityOptions.includes(plus2 as Ability) &&
    plus2 !== plus1
  ) {
    bonuses[plus2 as Ability] += 2;
  }

  if (
    plus1 &&
    definition.abilityOptions.includes(plus1 as Ability) &&
    plus1 !== plus2
  ) {
    bonuses[plus1 as Ability] += 1;
  }

  return bonuses;
}

export function isBackgroundAbilitySelectionComplete(
  backgroundId: string,
  mode: BackgroundAbilityMode,
  plus2: string,
  plus1: string,
): boolean {
  const definition = findBackgroundDetails(backgroundId);

  if (!definition) {
    return false;
  }

  if (mode === "even") {
    return true;
  }

  return (
    Boolean(plus2) &&
    Boolean(plus1) &&
    plus2 !== plus1 &&
    definition.abilityOptions.includes(plus2 as Ability) &&
    definition.abilityOptions.includes(plus1 as Ability)
  );
}
