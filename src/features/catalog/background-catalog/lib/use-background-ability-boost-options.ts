"use client";

import { useMemo } from "react";

import { buildBackgroundAbilityBoostOptions } from "@/entities/background/lib/background-ability-options";
import {
  useBackgroundDetail,
  useBackgrounds,
} from "@/features/catalog/background-catalog/api/use-backgrounds";

export function useBackgroundAbilityBoostOptions(backgroundSlug: string) {
  const backgrounds = useBackgrounds();
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const selectedBackground = backgrounds.data?.data.find(
    (background) => background.slug === backgroundSlug,
  );

  const allowedSlugs = useMemo(
    () =>
      backgroundDetail.data?.abilityOptionSlugs ??
      selectedBackground?.abilityOptionSlugs ??
      [],
    [
      backgroundDetail.data?.abilityOptionSlugs,
      selectedBackground?.abilityOptionSlugs,
    ],
  );

  const boostOptions = useMemo(
    () =>
      buildBackgroundAbilityBoostOptions(
        allowedSlugs,
        backgroundDetail.data?.abilityOptionNames ??
          selectedBackground?.abilityOptionNames,
      ),
    [
      allowedSlugs,
      backgroundDetail.data?.abilityOptionNames,
      selectedBackground?.abilityOptionNames,
    ],
  );

  const isLoading =
    !!backgroundSlug && backgroundDetail.isPending && boostOptions.length === 0;

  return {
    allowedSlugs,
    boostOptions,
    isLoading,
    backgroundName: selectedBackground?.name,
    selectedBackground,
    backgroundDetail,
  };
}
