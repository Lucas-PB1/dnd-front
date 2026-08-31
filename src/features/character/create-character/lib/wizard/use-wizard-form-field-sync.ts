"use client";

import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";

import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { countAsiFeatSlots } from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { ritualSpellSlotIndex } from "@/features/character/create-character/lib/feats/feat-option-requirements";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import { proficiencyBonusForLevel } from "@/features/character/create-character/lib/progression/proficiency-bonus-for-level";
import {
  SUBCLASS_REQUIRED_FROM_LEVEL,
  type CreateCharacterInput,
} from "@/features/character/create-character/model/create-character.schema";
import { useCharacterLevels } from "@/features/catalog/reference-catalog/api/use-reference";

type UseWizardFormFieldSyncParams = {
  level: number;
  classSlug: string;
  speciesSlug?: string;
  subclassSlug: string;
  backgroundSlug: string;
  originFeatSlug: string;
  setValue: UseFormSetValue<CreateCharacterInput>;
  getValues: UseFormGetValues<CreateCharacterInput>;
};

export function useWizardFormFieldSync({
  level,
  classSlug,
  speciesSlug,
  subclassSlug,
  backgroundSlug,
  originFeatSlug,
  setValue,
  getValues,
}: UseWizardFormFieldSyncParams) {
  const levels = useCharacterLevels();
  const levelCatalog = levels.data?.data;
  const prevClassSlugRef = useRef(classSlug);
  const prevSpeciesSlugRef = useRef(speciesSlug);
  const prevSubclassSlugRef = useRef(subclassSlug);
  const prevBackgroundSlugRef = useRef(backgroundSlug);

  useEffect(() => {
    if (level < SUBCLASS_REQUIRED_FROM_LEVEL) {
      setValue("subclassSlug", "");
      setValue("subclassOptions", []);
    }
  }, [level, setValue]);

  useEffect(() => {
    if (prevBackgroundSlugRef.current !== backgroundSlug) {
      setValue("backgroundAbilityBoostMode", "plus2plus1");
      setValue("backgroundAbilityBoostPlus2Slug", "");
      setValue("backgroundAbilityBoostPlus1Slug", "");
      setValue("backgroundAbilityBoostPlus1Slugs", ["", "", ""]);
      setValue("backgroundToolItemSlug", "");
      setValue("backgroundOriginFeatSlug", "");
      setValue("featOptions", []);
      setValue("asiFeatSlotSlugs", []);
      setValue("classSkillSlugs", []);
      setValue("languageSlugs", []);
      prevBackgroundSlugRef.current = backgroundSlug;
    }
  }, [backgroundSlug, setValue]);

  useEffect(() => {
    if (prevClassSlugRef.current !== classSlug) {
      setValue("classSkillSlugs", []);
      setValue("classOptions", []);
      setValue("subclassSlug", "");
      setValue("subclassOptions", []);
      setValue(
        "equipment",
        (getValues("equipment") ?? []).filter((e) => e.source !== "class"),
      );
      setValue("characterSpells", []);
      setValue("fightingStyleFeatSlug", "");
      prevClassSlugRef.current = classSlug;
    }
  }, [classSlug, setValue, getValues]);

  useEffect(() => {
    if (prevSpeciesSlugRef.current !== speciesSlug) {
      setValue("speciesChoices", []);
      prevSpeciesSlugRef.current = speciesSlug;
    }
  }, [speciesSlug, setValue]);

  useEffect(() => {
    if (prevSubclassSlugRef.current !== subclassSlug) {
      setValue("subclassOptions", []);
      prevSubclassSlugRef.current = subclassSlug;
    }
  }, [subclassSlug, setValue]);

  useEffect(() => {
    const count = countAsiFeatSlots(classSlug, level);
    const slots = getValues("asiFeatSlotSlugs") ?? [];
    if (slots.length > count) {
      setValue("asiFeatSlotSlugs", slots.slice(0, count));
      const preview = resolveCreateCharacterFeats(
        originFeatSlug || null,
        asiFeatSlotsToCharacterFeats(slots.slice(0, count)),
        getValues("speciesChoices") ?? [],
        getValues("classOptions") ?? [],
      );
      const keys = new Set(
        preview.map((f) => `${f.featSlug}:${f.instanceIndex}`),
      );
      const catalog = levelCatalog ?? [];
      const proficiencyBonus = catalog.length
        ? proficiencyBonusForLevel(level, catalog)
        : undefined;
      setValue(
        "featOptions",
        (getValues("featOptions") ?? []).filter((option) => {
          if (!keys.has(`${option.featSlug}:${option.instanceIndex}`)) {
            return false;
          }
          const slot = ritualSpellSlotIndex(option.optionKey);
          if (slot === null) return true;
          if (proficiencyBonus === undefined) return true;
          return slot <= proficiencyBonus;
        }),
      );
    }
  }, [level, classSlug, setValue, getValues, originFeatSlug, levelCatalog]);
}
