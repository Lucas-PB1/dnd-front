"use client";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { useSubclassOptions } from "@/features/catalog/class-catalog/api/use-classes";
import { shouldShowWizardSubclassStep } from "@/features/character/create-character/lib/subclass/wizard-subclass-step";

export function useWizardHasSubclassStep(
  level: number,
  subclassSlug: string,
  unlockLevel: number | null | undefined,
) {
  const needsQuery =
    isSubclassRequired(level, unlockLevel) && !!subclassSlug.trim();

  const optionsQuery = useSubclassOptions(subclassSlug, level, needsQuery);

  const optionCount = optionsQuery.data?.data.length ?? 0;
  const optionsLoaded =
    needsQuery && !optionsQuery.isPending && optionsQuery.isFetched;

  const hasSubclassStep = shouldShowWizardSubclassStep(
    level,
    subclassSlug,
    optionCount,
    optionsLoaded,
    unlockLevel,
  );

  return {
    hasSubclassStep,
    isLoading: needsQuery && optionsQuery.isPending,
  };
}
