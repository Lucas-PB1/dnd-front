"use client";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { useSubclassOptions } from "@/features/class-catalog/api/use-classes";
import { shouldShowWizardSubclassStep } from "@/features/create-character/lib/wizard-subclass-step";

export function useWizardHasSubclassStep(level: number, subclassSlug: string) {
  const needsQuery = isSubclassRequired(level) && !!subclassSlug.trim();

  const optionsQuery = useSubclassOptions(subclassSlug, level, needsQuery);

  const optionCount = optionsQuery.data?.data.length ?? 0;
  const optionsLoaded =
    needsQuery && !optionsQuery.isPending && optionsQuery.isFetched;

  const hasSubclassStep = shouldShowWizardSubclassStep(
    level,
    subclassSlug,
    optionCount,
    optionsLoaded,
  );

  return {
    hasSubclassStep,
    isLoading: needsQuery && optionsQuery.isPending,
  };
}
