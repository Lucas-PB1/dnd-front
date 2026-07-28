"use client";

import { useMemo, useState } from "react";

import type { ClassSpellOption } from "@/entities/class/types";
import {
  spellsForView,
  type SpellListView,
} from "@/features/character/create-character/lib/spells/class-spellcasting-ui";
import { filterClassSpells } from "@/features/character/create-character/lib/spells/wizard-spell-selection";

/** Filtros locais e listas visíveis do picker de magias. */
export function useSpellListFilters(
  availableClass: ClassSpellOption[],
  selectedSlugs: Set<string>,
) {
  const [search, setSearch] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [circle, setCircle] = useState("");
  const [listView, setListView] = useState<SpellListView>("all");

  const schools = useMemo(() => {
    const map = new Map<string, string>();
    for (const spell of availableClass) {
      map.set(spell.schoolSlug, spell.schoolName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt"));
  }, [availableClass]);

  const circleOptions = useMemo(() => {
    const levels = new Set(availableClass.map((spell) => spell.level));
    return [...levels].sort((a, b) => a - b);
  }, [availableClass]);

  const hasActiveFilters = Boolean(search.trim() || schoolSlug || circle);

  const filtered = useMemo(
    () =>
      filterClassSpells(availableClass, {
        q: search,
        schoolSlug,
        circle,
      }),
    [availableClass, search, schoolSlug, circle],
  );

  const cantripList = useMemo(
    () => filtered.filter((spell) => spell.level === 0),
    [filtered],
  );
  const leveledList = useMemo(
    () => filtered.filter((spell) => spell.level > 0),
    [filtered],
  );

  const visibleSpells = useMemo(() => {
    const base = spellsForView(
      listView,
      cantripList,
      leveledList,
      filtered,
      selectedSlugs,
    );
    return base as ClassSpellOption[];
  }, [listView, cantripList, leveledList, filtered, selectedSlugs]);

  const visibleCantrips = useMemo(
    () => visibleSpells.filter((spell) => spell.level === 0),
    [visibleSpells],
  );
  const visibleLeveled = useMemo(
    () => visibleSpells.filter((spell) => spell.level > 0),
    [visibleSpells],
  );

  function clearFilters() {
    setSearch("");
    setSchoolSlug("");
    setCircle("");
  }

  function onFilterChange(key: string, value: string) {
    if (key === "school") setSchoolSlug(value);
    if (key === "circle") setCircle(value);
  }

  return {
    search,
    setSearch,
    schoolSlug,
    circle,
    onFilterChange,
    clearFilters,
    hasActiveFilters,
    schools,
    circleOptions,
    filtered,
    listView,
    setListView,
    visibleCantrips,
    visibleLeveled,
    visibleSpells,
  };
}
