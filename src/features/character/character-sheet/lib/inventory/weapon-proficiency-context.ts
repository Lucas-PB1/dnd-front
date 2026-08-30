import { useMemo } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { WeaponProficiencyContext } from "@/entities/character/lib/weapon-proficiency";
import { isFightingStyleSubclassOptionKey } from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import { useClassDetail } from "@/features/catalog/class-catalog/api/use-classes";

export function buildWeaponProficiencyContext(
  character: Pick<CharacterDetail, "characterFeats" | "subclassOptions">,
): Omit<WeaponProficiencyContext, "weaponProficiencySlugs"> {
  const featSlugs = character.characterFeats.map((feat) => feat.featSlug);
  const fightingStyleSlugs = character.subclassOptions
    .filter((option) => isFightingStyleSubclassOptionKey(option.optionKey))
    .map((option) => option.valueId);
  return { featSlugs, fightingStyleSlugs };
}

export function useSheetWeaponProficiency(
  character: Pick<CharacterDetail, "classSlug" | "characterFeats" | "subclassOptions">,
) {
  const classDetail = useClassDetail(character.classSlug, true);

  const weaponProficiencySlugs = useMemo(
    () => classDetail.data?.weaponProficiencySlugs ?? [],
    [classDetail.data?.weaponProficiencySlugs],
  );

  const context = useMemo(
    () => buildWeaponProficiencyContext(character),
    [character],
  );

  return {
    weaponProficiencySlugs,
    ...context,
    isPending: classDetail.isPending,
  };
}
