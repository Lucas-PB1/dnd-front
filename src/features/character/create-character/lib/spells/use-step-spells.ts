"use client";

import { useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";

import type { ClassSpellOption } from "@/entities/class/types";
import {
  buildSpellPreviewActions,
  type SpellPreviewTarget,
} from "@/features/character/create-character/lib/spells/spell-preview-actions";
import { useSpellListFilters } from "@/features/character/create-character/lib/spells/use-spell-list-filters";
import { useSpellStepCatalog } from "@/features/character/create-character/lib/spells/use-spell-step-catalog";
import { useSpellStepFormValues } from "@/features/character/create-character/lib/spells/use-spell-step-form-values";
import { useSyncGrantedSpells } from "@/features/character/create-character/lib/spells/use-sync-granted-spells";
import {
  toggleCantrip,
  toggleLeveledSpell,
  toggleSubclassSpell,
} from "@/features/character/create-character/lib/spells/wizard-spell-selection";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

export type { SpellPreviewTarget };

export function useStepSpells(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
) {
  const form = useSpellStepFormValues(control);
  const catalog = useSpellStepCatalog({
    level: form.level,
    classSlug: form.classSlug,
    subclassSlug: form.subclassSlug,
    characterSpells: form.characterSpells,
    classOptions: form.classOptions,
  });

  useSyncGrantedSpells({
    speciesSlug: form.speciesSlug,
    classSlug: form.classSlug,
    level: form.level,
    subclassSlug: form.subclassSlug,
    speciesChoices: form.speciesChoices,
    featOptions: form.featOptions,
    characterFeats: form.characterFeats,
    characterSpells: form.characterSpells,
    playerPickedSpells: form.playerPickedSpells,
    setValue,
  });

  const filters = useSpellListFilters(
    catalog.availableClass,
    catalog.selectedSlugs,
  );

  const [hint, setHint] = useState<string | null>(null);
  const [preview, setPreview] = useState<SpellPreviewTarget | null>(null);

  function applySpells(next: typeof form.characterSpells) {
    setHint(null);
    setValue("characterSpells", next);
  }

  function onCantrip(spell: ClassSpellOption) {
    const result = toggleCantrip(
      form.characterSpells,
      spell,
      catalog.availableClass,
      catalog.cantripMax,
    );
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    applySpells(result.next);
  }

  function onLeveled(spell: ClassSpellOption, intent: "known" | "prepared") {
    const result = toggleLeveledSpell(
      form.characterSpells,
      spell,
      catalog.availableClass,
      catalog.mode,
      {
        leveledKnownMax: catalog.leveledKnownMax,
        leveledPreparedMax: catalog.leveledPreparedMax,
      },
      intent,
    );
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    applySpells(result.next);
  }

  function onSubclass(slug: string) {
    applySpells(toggleSubclassSpell(form.characterSpells, slug));
  }

  function onSetClassOption(optionKey: string, valueId: string) {
    const without = (form.classOptions ?? []).filter(
      (option) => option.optionKey !== optionKey,
    );
    setValue(
      "classOptions",
      valueId ? [...without, { optionKey, valueId }] : without,
      { shouldDirty: true },
    );
  }

  function previewActions(target: SpellPreviewTarget) {
    return buildSpellPreviewActions({
      target,
      availableClass: catalog.availableClass,
      characterSpells: form.characterSpells,
      selectedSlugs: catalog.selectedSlugs,
      mode: catalog.mode,
      uiProfile: catalog.uiProfile,
      atCantripLimit: catalog.atCantripLimit,
      atLeveledKnownLimit: catalog.atLeveledKnownLimit,
      atLeveledPreparedLimit: catalog.atLeveledPreparedLimit,
      onCantrip,
      onLeveled,
      onSubclass,
    });
  }

  return {
    level: form.level,
    classSlug: form.classSlug,
    className: catalog.className,
    isLoading: catalog.isLoading,
    availableClass: catalog.availableClass,
    availableSubclass: catalog.availableSubclass,
    characterSpells: form.characterSpells,
    classOptions: form.classOptions,
    onSetClassOption,
    uiProfile: catalog.uiProfile,
    mode: catalog.mode,
    counts: catalog.counts,
    cantripMax: catalog.cantripMax,
    leveledKnownMax: catalog.leveledKnownMax,
    leveledPreparedMax: catalog.leveledPreparedMax,
    progressionRow: catalog.progressionRow,
    slotLines: catalog.slotLines,
    slotRow: catalog.slotRow,
    hint,
    search: filters.search,
    setSearch: filters.setSearch,
    schoolSlug: filters.schoolSlug,
    circle: filters.circle,
    onFilterChange: filters.onFilterChange,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
    schools: filters.schools,
    circleOptions: filters.circleOptions,
    filtered: filters.filtered,
    listView: filters.listView,
    setListView: filters.setListView,
    selectedSlugs: catalog.selectedSlugs,
    visibleCantrips: filters.visibleCantrips,
    visibleLeveled: filters.visibleLeveled,
    visibleSpells: filters.visibleSpells,
    atCantripLimit: catalog.atCantripLimit,
    atLeveledKnownLimit: catalog.atLeveledKnownLimit,
    atLeveledPreparedLimit: catalog.atLeveledPreparedLimit,
    onCantrip,
    onLeveled,
    onSubclass,
    preview,
    setPreview,
    previewActions,
  };
}
