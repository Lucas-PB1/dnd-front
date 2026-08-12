"use client";

import { useMemo } from "react";

import { extraCantripsFromClassOrder } from "@/entities/character/lib/class-order-effects";
import { magicalSecretsListSlugs } from "@/entities/character/lib/magical-secrets";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { resolveSpellcastingUiProfile } from "@/features/character/create-character/lib/spells/class-spellcasting-ui";
import { resolveLevelProgression } from "@/features/character/create-character/lib/progression/resolve-level-progression";
import {
  classSpellcastingMode,
  countSpellsByType,
  formatSpellSlotsForLevel,
  wizardSpellbookLimitAtLevel,
} from "@/features/character/create-character/lib/spells/wizard-spell-selection";
import { maxSpellLevelFromSlots } from "@/features/character/create-character/lib/spells/wizard-spell-step";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  useClassDetail,
  useClassProgression,
  useClassSpells,
  useClassSpellSlots,
  useSubclassSpellcasting,
  useSubclassSpellSlots,
  useSubclassSpells,
} from "@/features/catalog/class-catalog/api/use-classes";

type SpellStepCatalogInput = {
  level: number;
  classSlug: string;
  subclassSlug: string;
  characterSpells: CreateCharacterInput["characterSpells"];
  classOptions?: CreateCharacterInput["classOptions"];
};

/** Catálogo, progressão, cotas e perfil de UI do passo de magias. */
export function useSpellStepCatalog({
  level,
  classSlug,
  subclassSlug,
  characterSpells,
  classOptions,
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
  const secretsLists = magicalSecretsListSlugs(classSlug, level);
  const secretsCleric = useClassSpells(
    "cleric",
    maxLevel,
    secretsLists.includes("cleric"),
  );
  const secretsDruid = useClassSpells(
    "druid",
    maxLevel,
    secretsLists.includes("druid"),
  );
  const secretsWizard = useClassSpells(
    "wizard",
    maxLevel,
    secretsLists.includes("wizard"),
  );

  const availableClass = useMemo(() => {
    const bySlug = new Map(
      (classSpells.data?.data ?? []).map((spell) => [spell.slug, spell]),
    );
    for (const extra of [
      secretsCleric.data?.data ?? [],
      secretsDruid.data?.data ?? [],
      secretsWizard.data?.data ?? [],
    ]) {
      for (const spell of extra) {
        if (!bySlug.has(spell.slug)) bySlug.set(spell.slug, spell);
      }
    }
    return [...bySlug.values()];
  }, [
    classSpells.data?.data,
    secretsCleric.data?.data,
    secretsDruid.data?.data,
    secretsWizard.data?.data,
  ]);
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

  const cantripMax =
    progressionRow?.cantrips == null
      ? null
      : progressionRow.cantrips + extraCantripsFromClassOrder(classOptions);
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
