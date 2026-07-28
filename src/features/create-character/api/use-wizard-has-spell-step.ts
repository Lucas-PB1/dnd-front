"use client";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  computeWizardHasSpellStep,
  maxSpellLevelFromSlots,
} from "@/features/create-character/lib/spells/wizard-spell-step";
import {
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpellcasting,
  useSubclassSpellSlots,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";

export function useWizardHasSpellStep(
  classSlug: string,
  subclassSlug: string,
  level: number,
) {
  const needsSubclass = isSubclassRequired(level) && !!subclassSlug;

  const classSpellSlots = useClassSpellSlots(classSlug, !!classSlug);
  const subclassSpellSlots = useSubclassSpellSlots(
    subclassSlug,
    needsSubclass,
  );
  const subclassSpellcasting = useSubclassSpellcasting(
    subclassSlug,
    needsSubclass,
  );

  const spellListClassSlug =
    subclassSpellcasting.data?.spellListClassSlug ?? classSlug;

  const slotRow =
    (subclassSpellSlots.data?.data ?? []).find(
      (row) => row.classLevel === level,
    ) ??
    (classSpellSlots.data?.data ?? []).find((row) => row.classLevel === level);

  const maxSpellLevel = maxSpellLevelFromSlots(slotRow?.spellSlots);
  const slotsReady =
    (!!classSlug && !classSpellSlots.isPending) ||
    (needsSubclass && !subclassSpellSlots.isPending);

  const classSpells = useClassSpells(
    spellListClassSlug,
    maxSpellLevel,
    slotsReady && !!spellListClassSlug,
  );
  const subclassSpells = useSubclassSpells(subclassSlug, needsSubclass);

  const subclassSpellCount = (subclassSpells.data?.data ?? []).filter(
    (spell) => spell.unlockLevel <= level,
  ).length;

  const hasSpellStep = computeWizardHasSpellStep({
    classSpellSlotCount: classSpellSlots.data?.data?.length ?? 0,
    classSpellCount: classSpells.data?.data?.length ?? 0,
    subclassSpellCount,
    subclassSpellSlotCount: subclassSpellSlots.data?.data?.length ?? 0,
  });

  const isLoading =
    (!!classSlug &&
      (classSpellSlots.isPending ||
        (slotsReady && classSpells.isPending))) ||
    (needsSubclass &&
      (subclassSpellSlots.isPending ||
        subclassSpellcasting.isPending ||
        subclassSpells.isPending));

  return { hasSpellStep, isLoading };
}
