import type { CharacterDetail } from "@/entities/character/types";
import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  collectActiveItemSlugs,
  type ActiveItemInventoryLike,
} from "@/features/character/character-sheet/lib/combat/active-item-slugs";
import {
  resolveClassEconomyActions,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { economyFeatSlugsFromCharacter } from "@/features/character/character-sheet/lib/combat/economy-feat-slugs";

export function resolveEconomyActionsForCharacter(input: {
  character: CharacterDetail;
  catalog: readonly ClassEconomyActionRecord[];
  inventoryItems?: readonly ActiveItemInventoryLike[];
}): ClassEconomyAction[] {
  const { character, catalog, inventoryItems } = input;
  return resolveClassEconomyActions(catalog, {
    classSlug: character.classSlug,
    level: character.level,
    subclassSlug: character.subclassSlug,
    speciesSlug: character.speciesSlug ?? undefined,
    speciesChoices: character.speciesChoices,
    heritageChoices: character.heritageChoices,
    activeThread: character.thread?.active
      ? {
          threadSlug: character.thread.active.threadSlug,
          benefitKeys: character.thread.active.milestones.map(
            (milestone) => milestone.benefitKey,
          ),
        }
      : null,
    featSlugs: economyFeatSlugsFromCharacter(character),
    transformation: character.transformation ?? null,
    activeItemSlugs: collectActiveItemSlugs({
      inventoryItems,
      weaponAttacks: character.weaponAttacks,
    }),
  });
}
