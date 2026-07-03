import { useEffect, useRef } from "react";

import {
  applyClassProficiencyBaseWithOrigin,
  resetClassProficienciesOnClassChange,
  syncClassSkillProficiencies,
} from "@/features/character-sheet/model/apply-class-proficiencies";
import {
  syncBackgroundSkillProficiencies,
  syncSpeciesSkillProficiency,
} from "@/features/character-sheet/model/apply-origin-benefits";
import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";

type ProficiencyStepSyncParams = Pick<
  CharacterSheetFormProps,
  "watch" | "setValue"
> & {
  characterClass: string;
  characterLevel: string;
  backgroundId: string;
  speciesId: string;
  speciesSkillChoice: string;
  classSkillChoices: string[];
};

export function useProficiencyStepSync({
  setValue,
  characterClass,
  characterLevel,
  backgroundId,
  speciesId,
  speciesSkillChoice,
  classSkillChoices,
}: ProficiencyStepSyncParams) {
  const previousClassRef = useRef(characterClass);

  useEffect(() => {
    if (previousClassRef.current !== characterClass) {
      resetClassProficienciesOnClassChange(
        setValue,
        previousClassRef.current,
        characterClass,
        characterLevel,
        backgroundId,
      );
      previousClassRef.current = characterClass;
    } else {
      applyClassProficiencyBaseWithOrigin(
        setValue,
        characterClass,
        characterLevel,
        backgroundId,
      );
    }

    if (characterClass && classSkillChoices.length > 0) {
      syncClassSkillProficiencies(setValue, characterClass, classSkillChoices);
    }

    if (backgroundId) {
      syncBackgroundSkillProficiencies(setValue, backgroundId);
    }

    syncSpeciesSkillProficiency(setValue, speciesId, speciesSkillChoice);
  }, [
    backgroundId,
    characterClass,
    characterLevel,
    classSkillChoices,
    setValue,
    speciesId,
    speciesSkillChoice,
  ]);
}
