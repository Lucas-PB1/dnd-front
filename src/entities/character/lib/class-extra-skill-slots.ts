/**
 * Espelha dnd-api `class-extra-skill-slots.ts`.
 */

export type ClassExtraSkillSlot = {
  optionKey: string;
  unlockLevel: number;
};

export const PRIMORDIAL_KNOWLEDGE_SKILL_KEY = "primordialKnowledgeSkill";

const CLASS_EXTRA_SKILL_SLOTS: Readonly<
  Record<string, readonly ClassExtraSkillSlot[]>
> = {
  barbarian: [{ optionKey: PRIMORDIAL_KNOWLEDGE_SKILL_KEY, unlockLevel: 3 }],
};

export function classExtraSkillSlots(
  classSlug: string | null | undefined,
): readonly ClassExtraSkillSlot[] {
  return CLASS_EXTRA_SKILL_SLOTS[classSlug ?? ""] ?? [];
}

export function classExtraSkillSlotsAtLevel(
  classSlug: string | null | undefined,
  level: number,
): ClassExtraSkillSlot[] {
  return classExtraSkillSlots(classSlug).filter(
    (slot) => slot.unlockLevel <= level,
  );
}

export function isClassExtraSkillOptionKey(optionKey: string): boolean {
  return optionKey === PRIMORDIAL_KNOWLEDGE_SKILL_KEY;
}

export function collectClassExtraSkillSlugs(
  classOptions: readonly { optionKey: string; valueId: string }[] | undefined,
): string[] {
  if (!classOptions?.length) return [];
  return classOptions
    .filter(
      (option) => isClassExtraSkillOptionKey(option.optionKey) && option.valueId,
    )
    .map((option) => option.valueId);
}
