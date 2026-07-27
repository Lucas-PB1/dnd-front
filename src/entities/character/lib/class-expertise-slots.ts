/**
 * Espelha dnd-api `game/sheet/domain/class-expertise-slots.ts`.
 */

export type ClassExpertiseSlot = {
  optionKey: string;
  unlockLevel: number;
};

export const WIZARD_SCHOLAR_SKILL_SLUGS = [
  "arcana",
  "history",
  "investigation",
  "medicine",
  "nature",
  "religion",
] as const;

const CLASS_EXPERTISE_SLOTS: Readonly<
  Record<string, readonly ClassExpertiseSlot[]>
> = {
  rogue: [
    { optionKey: "expertiseSkill1", unlockLevel: 1 },
    { optionKey: "expertiseSkill2", unlockLevel: 1 },
    { optionKey: "expertiseSkill3", unlockLevel: 6 },
    { optionKey: "expertiseSkill4", unlockLevel: 6 },
  ],
  bard: [
    { optionKey: "expertiseSkill1", unlockLevel: 2 },
    { optionKey: "expertiseSkill2", unlockLevel: 2 },
    { optionKey: "expertiseSkill3", unlockLevel: 9 },
    { optionKey: "expertiseSkill4", unlockLevel: 9 },
  ],
  ranger: [
    { optionKey: "expertiseSkill1", unlockLevel: 2 },
    { optionKey: "expertiseSkill2", unlockLevel: 9 },
    { optionKey: "expertiseSkill3", unlockLevel: 9 },
  ],
  wizard: [{ optionKey: "expertiseSkill1", unlockLevel: 2 }],
};

export function classExpertiseSlots(
  classSlug: string | null | undefined,
): readonly ClassExpertiseSlot[] {
  return CLASS_EXPERTISE_SLOTS[classSlug ?? ""] ?? [];
}

export function classExpertiseSlotsAtLevel(
  classSlug: string | null | undefined,
  level: number,
): ClassExpertiseSlot[] {
  return classExpertiseSlots(classSlug).filter(
    (slot) => slot.unlockLevel <= level,
  );
}

export function classExpertiseSlotsNewAtLevel(
  classSlug: string | null | undefined,
  level: number,
): ClassExpertiseSlot[] {
  return classExpertiseSlots(classSlug).filter(
    (slot) => slot.unlockLevel === level,
  );
}

export function isClassExpertiseOptionKey(optionKey: string): boolean {
  return /^expertiseSkill\d+$/.test(optionKey);
}

export function allowedExpertiseSkillSlugsForClass(
  classSlug: string | null | undefined,
): readonly string[] | null {
  if (classSlug === "wizard") return WIZARD_SCHOLAR_SKILL_SLUGS;
  return null;
}

export function hasJackOfAllTrades(
  classSlug: string | null | undefined,
  level: number,
): boolean {
  return classSlug === "bard" && level >= 2;
}
