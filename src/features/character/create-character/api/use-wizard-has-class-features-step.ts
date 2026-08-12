"use client";

import { useClassFeatureOptions } from "@/features/catalog/class-catalog/api/use-classes";

export function useWizardHasClassFeaturesStep(
  classSlug: string,
  level: number,
) {
  const enabled = !!classSlug.trim() && level > 0;
  const optionsQuery = useClassFeatureOptions(classSlug, level, enabled);
  const optionCount = optionsQuery.data?.data.length ?? 0;
  const optionsLoaded = enabled && !optionsQuery.isPending && optionsQuery.isFetched;

  return {
    hasClassFeaturesStep: optionsLoaded ? optionCount > 0 : enabled,
    classFeatureOptions: optionsQuery.data?.data,
    isLoading: enabled && optionsQuery.isPending,
  };
}
