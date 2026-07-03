import type { Ability } from "@/entities/character-sheet/constants/abilities";
import type { SkillKey } from "@/entities/character-sheet/constants/skills";
import type { CharacterBackgroundId } from "@/entities/character-sheet/data/origins";

export type BackgroundAbilityMode = "split" | "even";

export type BackgroundDefinition = {
  id: CharacterBackgroundId;
  abilityOptions: readonly [Ability, Ability, Ability];
  originFeat: string;
  skills: readonly SkillKey[];
  toolsLabel: string;
};
