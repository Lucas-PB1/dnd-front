import { useCallback, useState } from "react";

export type WizardStepErrors = {
  skillsError: string | undefined;
  abilitiesError: string | undefined;
  speciesError: string | undefined;
  subclassError: string | undefined;
  classFeaturesError: string | undefined;
  backgroundError: string | undefined;
  featsError: string | undefined;
};

export function useWizardStepErrors() {
  const [skillsError, setSkillsError] = useState<string | undefined>();
  const [abilitiesError, setAbilitiesError] = useState<string | undefined>();
  const [speciesError, setSpeciesError] = useState<string | undefined>();
  const [subclassError, setSubclassError] = useState<string | undefined>();
  const [classFeaturesError, setClassFeaturesError] = useState<
    string | undefined
  >();
  const [backgroundError, setBackgroundError] = useState<string | undefined>();
  const [featsError, setFeatsError] = useState<string | undefined>();

  const clearStepErrors = useCallback(() => {
    setSkillsError(undefined);
    setAbilitiesError(undefined);
    setSpeciesError(undefined);
    setSubclassError(undefined);
    setClassFeaturesError(undefined);
    setBackgroundError(undefined);
    setFeatsError(undefined);
  }, []);

  return {
    skillsError,
    abilitiesError,
    speciesError,
    subclassError,
    classFeaturesError,
    backgroundError,
    featsError,
    setSkillsError,
    setAbilitiesError,
    setSpeciesError,
    setSubclassError,
    setClassFeaturesError,
    setBackgroundError,
    setFeatsError,
    clearStepErrors,
  };
}
