"use client";

import { useMemo } from "react";

import type { SubclassOptionGroup } from "@/entities/class/types";
import { mergeClassSpellLists } from "@/features/character/create-character/lib/subclass/resolve-subclass-option-select";
import {
  BLADE_HOLY_CANTRIP_KEYS,
  LORE_MAGICAL_DISCOVERY_KEYS,
  loreMagicalDiscoveryMaxLevel,
} from "@/features/character/create-character/lib/subclass/subclass-option-keys";
import { isSangromancySavantOptionKey } from "@/entities/spell/lib/sangromancy";
import {
  useClassSkills,
  useClassSpells,
} from "@/features/catalog/class-catalog/api/use-classes";
import { useSangromancySpells } from "@/features/catalog/spell-catalog/api/use-spells";
import { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";

export function useSubclassOptionCatalog(
  groups: SubclassOptionGroup[],
  level: number,
  classSlug: string,
) {
  const needsLoreSpells = groups.some((group) =>
    LORE_MAGICAL_DISCOVERY_KEYS.has(group.optionKey),
  );
  const needsBladeCantrips = groups.some((group) =>
    BLADE_HOLY_CANTRIP_KEYS.has(group.optionKey),
  );
  const needsWizardVersatility = groups.some(
    (group) =>
      group.valueType === "spell" &&
      !LORE_MAGICAL_DISCOVERY_KEYS.has(group.optionKey) &&
      !BLADE_HOLY_CANTRIP_KEYS.has(group.optionKey) &&
      !isSangromancySavantOptionKey(group.optionKey),
  );
  const needsSangromancySpells = groups.some((group) =>
    isSangromancySavantOptionKey(group.optionKey),
  );
  const needsFighterSkills = groups.some(
    (group) => group.optionKey === "warScholarSkill",
  );
  const needsSkills = groups.some((group) => group.valueType === "skill_list");

  const loreMaxLevel = loreMagicalDiscoveryMaxLevel(level);
  const clericSpells = useClassSpells(
    "cleric",
    loreMaxLevel,
    needsLoreSpells,
  );
  const clericCantrips = useClassSpells("cleric", 0, needsBladeCantrips);
  const druidSpells = useClassSpells("druid", loreMaxLevel, needsLoreSpells);
  const wizardLoreSpells = useClassSpells(
    "wizard",
    loreMaxLevel,
    needsLoreSpells,
  );
  const wizardVersatilitySpells = useClassSpells(
    "wizard",
    2,
    needsWizardVersatility,
  );
  const sangromancySpells = useSangromancySpells(9, needsSangromancySpells);
  const fighterSkills = useClassSkills(
    classSlug,
    needsFighterSkills && classSlug === "fighter",
  );
  const allSkills = useSkills();

  const loreSpells = useMemo(
    () =>
      mergeClassSpellLists([
        clericSpells.data?.data ?? [],
        druidSpells.data?.data ?? [],
        wizardLoreSpells.data?.data ?? [],
      ]),
    [
      clericSpells.data?.data,
      druidSpells.data?.data,
      wizardLoreSpells.data?.data,
    ],
  );

  return {
    allSkills: allSkills.data?.data ?? [],
    allSkillsLoading: needsSkills && allSkills.isPending,
    fighterClassSkills: fighterSkills.data?.data ?? [],
    fighterSkillsLoading:
      needsFighterSkills && classSlug === "fighter" && fighterSkills.isPending,
    loreSpells,
    loreSpellsLoading:
      needsLoreSpells &&
      (clericSpells.isPending ||
        druidSpells.isPending ||
        wizardLoreSpells.isPending),
    clericCantrips: clericCantrips.data?.data ?? [],
    clericCantripsLoading: needsBladeCantrips && clericCantrips.isPending,
    wizardSpells: wizardVersatilitySpells.data?.data ?? [],
    wizardSpellsLoading:
      needsWizardVersatility && wizardVersatilitySpells.isPending,
    sangromancySpells: sangromancySpells.data?.data ?? [],
    sangromancySpellsLoading:
      needsSangromancySpells && sangromancySpells.isPending,
  };
}
