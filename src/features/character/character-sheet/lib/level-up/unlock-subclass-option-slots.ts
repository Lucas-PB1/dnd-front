import type { LevelUpSubclassOptionSlot } from "@/entities/character/session-types";
import type { SubclassOptionGroup } from "@/entities/class/types";

/**
 * No unlock, o preview ainda não tem subclassSlug — slots vêm do catálogo
 * da trilha escolhida em draft (só opções que desbloqueiam neste nível).
 */
export function resolveLevelUpSubclassOptionSlots(input: {
  previewSlots: readonly LevelUpSubclassOptionSlot[] | undefined;
  subclassRequired: boolean;
  draftSubclassSlug: string;
  draftOptionGroups: readonly SubclassOptionGroup[] | undefined;
  nextLevel: number;
}): LevelUpSubclassOptionSlot[] {
  const fromPreview = input.previewSlots ?? [];
  if (fromPreview.length > 0) return [...fromPreview];

  if (!input.subclassRequired || !input.draftSubclassSlug.trim()) {
    return [];
  }

  return (input.draftOptionGroups ?? [])
    .filter((group) => group.unlockLevel === input.nextLevel)
    .map((group) => ({
      optionKey: group.optionKey,
      label: group.label,
      unlockLevel: group.unlockLevel,
    }));
}
