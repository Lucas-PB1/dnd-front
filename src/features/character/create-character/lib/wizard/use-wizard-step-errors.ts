import { useCallback, useState } from "react";

export type WizardStepErrors = {
  identityError: string | undefined;
  skillsError: string | undefined;
  abilitiesError: string | undefined;
  speciesError: string | undefined;
  subclassError: string | undefined;
  classFeaturesError: string | undefined;
  backgroundError: string | undefined;
  featsError: string | undefined;
  equipmentError: string | undefined;
  languagesError: string | undefined;
};

export function useWizardStepErrors() {
  const [identityError, setIdentityError] = useState<string | undefined>();
  const [skillsError, setSkillsError] = useState<string | undefined>();
  const [abilitiesError, setAbilitiesError] = useState<string | undefined>();
  const [speciesError, setSpeciesError] = useState<string | undefined>();
  const [subclassError, setSubclassError] = useState<string | undefined>();
  const [classFeaturesError, setClassFeaturesError] = useState<
    string | undefined
  >();
  const [backgroundError, setBackgroundError] = useState<string | undefined>();
  const [featsError, setFeatsError] = useState<string | undefined>();
  const [equipmentError, setEquipmentError] = useState<string | undefined>();
  const [languagesError, setLanguagesError] = useState<string | undefined>();

  const clearStepErrors = useCallback(() => {
    setIdentityError(undefined);
    setSkillsError(undefined);
    setAbilitiesError(undefined);
    setSpeciesError(undefined);
    setSubclassError(undefined);
    setClassFeaturesError(undefined);
    setBackgroundError(undefined);
    setFeatsError(undefined);
    setEquipmentError(undefined);
    setLanguagesError(undefined);
  }, []);

  return {
    identityError,
    skillsError,
    abilitiesError,
    speciesError,
    subclassError,
    classFeaturesError,
    backgroundError,
    featsError,
    equipmentError,
    languagesError,
    setIdentityError,
    setSkillsError,
    setAbilitiesError,
    setSpeciesError,
    setSubclassError,
    setClassFeaturesError,
    setBackgroundError,
    setFeatsError,
    setEquipmentError,
    setLanguagesError,
    clearStepErrors,
  };
}
