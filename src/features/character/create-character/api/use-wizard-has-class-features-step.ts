"use client";

import { isClassExpertiseOptionKey } from "@/entities/character/lib/class-expertise-slots";
import { isClassExtraSkillOptionKey } from "@/entities/character/lib/class-extra-skill-slots";
import { isClassWeaponMasteryOptionKey } from "@/entities/character/lib/class-weapon-mastery-slots";
import { useClassFeatureOptions } from "@/features/catalog/class-catalog/api/use-classes";

function isSkillsStepClassOption(optionKey: string): boolean {
  return (
    isClassExpertiseOptionKey(optionKey) ||
    isClassExtraSkillOptionKey(optionKey) ||
    isClassWeaponMasteryOptionKey(optionKey)
  );
}

export function useWizardHasClassFeaturesStep(
  classSlug: string,
  level: number,
) {
  const enabled = !!classSlug.trim() && level > 0;
  const optionsQuery = useClassFeatureOptions(classSlug, level, enabled);
  const allOptions = optionsQuery.data?.data ?? [];
  const classFeatureOptions = allOptions.filter(
    (option) => !isSkillsStepClassOption(option.optionKey),
  );
  const optionsLoaded =
    enabled && !optionsQuery.isPending && optionsQuery.isFetched;

  return {
    hasClassFeaturesStep: optionsLoaded
      ? classFeatureOptions.length > 0
      : enabled,
    classFeatureOptions,
    allClassOptions: allOptions,
    isLoading: enabled && optionsQuery.isPending,
  };
}
