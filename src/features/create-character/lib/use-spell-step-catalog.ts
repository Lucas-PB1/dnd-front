"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { resolveSpellcastingUiProfile } from "@/features/create-character/lib/class-spellcasting-ui";
import { resolveLevelProgression } from "@/features/create-character/lib/resolve-level-progression";
import {
  classSpellcastingMode,
  countSpellsByType,
  formatSpellSlotsForLevel,
  wizardSpellbookLimitAtLevel,
} from "@/features/create-character/lib/wizard-spell-selection";
import { maxSpellLevelFromSlots } from "@/features/create-character/lib/wizard-spell-step";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  useClassDetail,
  useClassProgression,
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpellcasting,
  useSubclassSpellSlots,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";

type SpellStepCatalogInput = {
  level: number;
  classSlug: string;
  subclassSlug: string;
  characterSpells: CreateCharacterInput["characterSpells"];
};

/** Catálogo, progressão, cotas e perfil de UI do passo de magias. */
export function useSpellStepCatalog({
  level,
  classSlug,
  subclassSlug,
  characterSpells,
}: SpellStepCatalogInput) {
  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSpellSlotsQuery = useClassSpellSlots(classSlug, !!classSlug);
  const subclassSpellSlotsQuery = useSubclassSpellSlots(
    subclassSlug ?? "",
    isSubclassRequired(level) && !!subclassSlug,
  );
  const subclassSpellcasting = useSubclassSpellcasting(
    subclassSlug ?? "",
    isSubclassRequired(level) && !!subclassSlug,
  );
  const progressionQuery = useClassProgression(classSlug, !!classSlug);
  const subclassSpells = useSubclassSpells(
    subclassSlug ?? "",
    isSubclassRequired(level) && !!subclassSlug,
  );

  const modeOverride = subclassSpellcasting.data?.spellcastingMode ?? null;
  const mode = classSpellcastingMode(classSlug, modeOverride);
  const spellListClassSlug =
    subclassSpellcasting.data?.spellListClassSlug ?? classSlug;

  const slotRow =
    (subclassSpellSlotsQuery.data?.data ?? []).find(
      (row) => row.classLevel === level,
    ) ??
    (classSpellSlotsQuery.data?.data ?? []).find(
      (row) => row.classLevel === level,
    );
  const maxLevel = maxSpellLevelFromSlots(slotRow?.spellSlots);
  const slotsReady =
    (!!classSlug && !classSpellSlotsQuery.isPending) ||
    (!!subclassSlug && !subclassSpellSlotsQuery.isPending);
  const classSpells = useClassSpells(
    spellListClassSlug,
    maxLevel,
    slotsReady && !!spellListClassSlug,
  );

  const availableClass = useMemo(
    () => classSpells.data?.data ?? [],
    [classSpells.data?.data],
  );
  const availableSubclass = useMemo(
    () =>
      (subclassSpells.data?.data ?? []).filter(
        (spell) => spell.unlockLevel <= level,
      ),
    [subclassSpells.data?.data, level],
  );

  const progressionRow = resolveLevelProgression(
    level,
    (progressionQuery.data?.data ?? []).find((row) => row.level === level),
    slotRow,
  );
  const slotLines = formatSpellSlotsForLevel(slotRow?.spellSlots);

  const uiProfile = resolveSpellcastingUiProfile(
    classSlug,
    slotRow?.patternSlug,
    mode,
    progressionRow,
    subclassSlug || undefined,
  );

  const cantripMax = progressionRow?.cantrips ?? null;
  const leveledPreparedMax = progressionRow?.preparedSpells ?? null;
  const leveledKnownMax =
    mode === "wizard"
      ? wizardSpellbookLimitAtLevel(level, leveledPreparedMax)
      : mode === "known"
        ? leveledPreparedMax
        : null;

  const counts = useMemo(
    () => countSpellsByType(characterSpells, availableClass),
    [characterSpells, availableClass],
  );

  const atCantripLimit = cantripMax != null && counts.cantrips >= cantripMax;
  const atLeveledKnownLimit =
    leveledKnownMax != null && counts.leveledKnown >= leveledKnownMax;
  const atLeveledPreparedLimit =
    leveledPreparedMax != null && counts.leveledPrepared >= leveledPreparedMax;

  const selectedSlugs = useMemo(
    () => new Set(characterSpells.map((spell) => spell.spellSlug)),
    [characterSpells],
  );

  // isLoading (e não isPending) para não travar em "carregando" quando a query
  // está desabilitada ou já falhou — classe sem magia responde 404.
  const isLoading =
    classSpells.isLoading ||
    classSpellSlotsQuery.isLoading ||
    subclassSpellSlotsQuery.isLoading ||
    progressionQuery.isLoading ||
    subclassSpells.isLoading;

  return {
    className: classDetail.data?.name ?? "Classe",
    isLoading,
    availableClass,
    availableSubclass,
    mode,
    uiProfile,
    counts,
    cantripMax,
    leveledKnownMax,
    leveledPreparedMax,
    atCantripLimit,
    atLeveledKnownLimit,
    atLeveledPreparedLimit,
    selectedSlugs,
    progressionRow,
    slotLines,
    slotRow,
  };
}
