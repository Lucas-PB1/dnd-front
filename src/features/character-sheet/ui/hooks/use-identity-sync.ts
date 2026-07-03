import { useEffect, useRef } from "react";

import {
  buildOriginFeatsText,
  resetBackgroundOriginOnChange,
  syncAbilityScoresWithOriginBonuses,
  syncBackgroundSkillProficiencies,
} from "@/features/character-sheet/model/apply-origin-benefits";
import {
  clearSpeciesSkillProficiency,
  resetSpeciesSelection,
  syncAllSpeciesBenefits,
} from "@/features/character-sheet/model/apply-species-benefits";
import type { BackgroundAbilityMode } from "@/entities/character-sheet/background-details";
import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";

type IdentitySyncParams = Pick<
  CharacterSheetFormProps,
  "watch" | "setValue"
> & {
  speciesId: string;
  backgroundId: string;
  characterClass: string;
  backgroundMode: BackgroundAbilityMode;
  backgroundPlus2: string;
  backgroundPlus1: string;
  speciesSkillChoice: string;
  speciesOriginFeat: string;
};

export function useIdentitySync({
  watch,
  setValue,
  speciesId,
  backgroundId,
  characterClass,
  backgroundMode,
  backgroundPlus2,
  backgroundPlus1,
  speciesSkillChoice,
  speciesOriginFeat,
}: IdentitySyncParams) {
  const previousBackgroundRef = useRef(backgroundId);
  const previousSpeciesRef = useRef({
    id: speciesId,
    skill: speciesSkillChoice,
  });

  useEffect(() => {
    if (previousBackgroundRef.current !== backgroundId) {
      resetBackgroundOriginOnChange(
        setValue,
        previousBackgroundRef.current,
        backgroundId,
        speciesId,
        speciesOriginFeat,
        characterClass,
      );
      previousBackgroundRef.current = backgroundId;
    } else if (backgroundId) {
      syncBackgroundSkillProficiencies(setValue, backgroundId);
      setValue(
        "feats",
        buildOriginFeatsText(backgroundId, speciesId, speciesOriginFeat),
      );
    }
  }, [backgroundId, characterClass, setValue, speciesId, speciesOriginFeat]);

  useEffect(() => {
    syncAbilityScoresWithOriginBonuses(
      setValue,
      watch,
      backgroundId,
      backgroundMode,
      backgroundPlus2,
      backgroundPlus1,
    );
  }, [
    backgroundId,
    backgroundMode,
    backgroundPlus1,
    backgroundPlus2,
    setValue,
    watch,
  ]);

  useEffect(() => {
    const previous = previousSpeciesRef.current;

    if (previous.id !== speciesId) {
      resetSpeciesSelection(
        setValue,
        previous.id,
        previous.skill,
        speciesId,
        backgroundId,
      );
      previousSpeciesRef.current = { id: speciesId, skill: "" };
      return;
    }

    if (previous.skill && previous.skill !== speciesSkillChoice) {
      clearSpeciesSkillProficiency(setValue, speciesId, previous.skill);
    }

    syncAllSpeciesBenefits(
      setValue,
      speciesId,
      speciesSkillChoice,
      speciesOriginFeat,
      backgroundId,
    );
    previousSpeciesRef.current = { id: speciesId, skill: speciesSkillChoice };
  }, [
    backgroundId,
    setValue,
    speciesId,
    speciesOriginFeat,
    speciesSkillChoice,
  ]);
}
