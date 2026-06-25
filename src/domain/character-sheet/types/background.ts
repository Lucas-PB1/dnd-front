import type { Ability } from "@/domain/character-sheet/constants/abilities";
import type { SkillKey } from "@/domain/character-sheet/constants/skills";
import type { CharacterBackgroundId } from "@/domain/character-sheet/data/origins";

export type BackgroundAbilityMode = "split" | "even";

export type BackgroundDefinition = {
  id: CharacterBackgroundId;
  abilityOptions: readonly [Ability, Ability, Ability];
  originFeat: string;
  skills: readonly SkillKey[];
  toolsLabel: string;
};
