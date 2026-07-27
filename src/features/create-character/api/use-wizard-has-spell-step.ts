"use client";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  computeWizardHasSpellStep,
  maxSpellLevelFromSlots,
} from "@/features/create-character/lib/wizard-spell-step";
import {
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";

export function useWizardHasSpellStep(
  classSlug: string,
  subclassSlug: string,
  level: number,
) {
  const needsSubclass = isSubclassRequired(level) && !!subclassSlug;

  const spellSlots = useClassSpellSlots(classSlug, !!classSlug);
  const slotRow = (spellSlots.data?.data ?? []).find(
    (row) => row.classLevel === level,
  );
  const maxSpellLevel = maxSpellLevelFromSlots(slotRow?.spellSlots);
  const slotsReady = !!classSlug && !spellSlots.isPending;

  const classSpells = useClassSpells(classSlug, maxSpellLevel, slotsReady);
  const subclassSpells = useSubclassSpells(subclassSlug, needsSubclass);

  const subclassSpellCount = (subclassSpells.data?.data ?? []).filter(
    (spell) => spell.unlockLevel <= level,
  ).length;

  const hasSpellStep = computeWizardHasSpellStep({
    classSpellSlotCount: spellSlots.data?.data?.length ?? 0,
    classSpellCount: classSpells.data?.data?.length ?? 0,
    subclassSpellCount,
  });

  const isLoading =
    (!!classSlug && (spellSlots.isPending || classSpells.isPending)) ||
    (needsSubclass && subclassSpells.isPending);

  return { hasSpellStep, isLoading };
}
