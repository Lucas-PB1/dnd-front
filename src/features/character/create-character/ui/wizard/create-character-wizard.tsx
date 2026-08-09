"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useClassDetail,
  useClassProgression,
  useSubclassOptions,
} from "@/features/catalog/class-catalog/api/use-classes";
import { useCreateCharacter } from "@/features/character/create-character/api/use-create-character";
import { useWizardHasSubclassStep } from "@/features/character/create-character/api/use-wizard-has-subclass-step";
import { useWizardHasSpellStep } from "@/features/character/create-character/api/use-wizard-has-spell-step";
import { advanceWizardStep } from "@/features/character/create-character/lib/wizard/advance-wizard-step";
import { countAsiFeatSlots } from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { CREATE_CHARACTER_DEFAULT_VALUES } from "@/features/character/create-character/lib/wizard/create-character-defaults";
import { useWizardFormFieldSync } from "@/features/character/create-character/lib/wizard/use-wizard-form-field-sync";
import { useWizardStepErrors } from "@/features/character/create-character/lib/wizard/use-wizard-step-errors";
import {
  createCharacterSchema,
  type CreateCharacterInput,
} from "@/features/character/create-character/model/create-character.schema";
import { toCreateCharacterPayload } from "@/features/character/create-character/model/to-create-payload";
import {
  prevWizardStep,
  visibleWizardSteps,
  type WizardNavOptions,
  type WizardStepId,
} from "@/features/character/create-character/model/wizard-steps";
import { WizardFooterNav } from "@/features/character/create-character/ui/wizard/wizard-footer-nav";
import { WizardStepContent } from "@/features/character/create-character/ui/wizard/wizard-step-content";
import { WizardStepIndicator } from "@/features/character/create-character/ui/wizard/wizard-step-indicator";
import { WizardSubmitError } from "@/features/character/create-character/ui/wizard/wizard-submit-error";
import { useSpeciesTraitChoices } from "@/features/catalog/species-catalog/api/use-species";
import { useBackgroundDetail } from "@/features/catalog/background-catalog/api/use-backgrounds";

export function CreateCharacterWizard() {
  const router = useRouter();
  const create = useCreateCharacter();
  const [step, setStep] = useState<WizardStepId>("identity");
  const stepErrors = useWizardStepErrors();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<CreateCharacterInput>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: CREATE_CHARACTER_DEFAULT_VALUES,
    mode: "onChange",
  });

  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });
  const level = useWatch({ control, name: "level", defaultValue: 1 });

  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classProgression = useClassProgression(classSlug, !!classSlug);
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const speciesTraits = useSpeciesTraitChoices(speciesSlug, !!speciesSlug);
  const subclassOpts = useSubclassOptions(
    subclassSlug ?? "",
    level,
    isSubclassRequired(level) && !!subclassSlug,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? "";
  const asiSlotCount = countAsiFeatSlots(classSlug, level);
  const hasFightingStylePick =
    (classDetail.data?.fightingStyleSlugs?.length ?? 0) > 0;
  const hasFeatsStep =
    !!originFeatSlug || asiSlotCount > 0 || hasFightingStylePick;
  const { hasSpellStep } = useWizardHasSpellStep(
    classSlug,
    subclassSlug ?? "",
    level,
  );
  const { hasSubclassStep } = useWizardHasSubclassStep(
    level,
    subclassSlug ?? "",
  );

  const wizardNav: WizardNavOptions = {
    skipSpells: !hasSpellStep,
    skipFeats: !hasFeatsStep,
    skipSubclass: !hasSubclassStep,
    skipInvocations: classSlug !== "warlock",
    skipMetamagics: classSlug !== "sorcerer" || level < 2,
  };
  const visibleSteps = visibleWizardSteps(wizardNav);

  useWizardFormFieldSync({
    level,
    classSlug,
    speciesSlug,
    subclassSlug: subclassSlug ?? "",
    backgroundSlug,
    originFeatSlug,
    setValue,
    getValues,
  });

  async function goNext() {
    await advanceWizardStep({
      step,
      getValues,
      trigger,
      setStep,
      clearStepErrors: stepErrors.clearStepErrors,
      setAbilitiesError: stepErrors.setAbilitiesError,
      setSkillsError: stepErrors.setSkillsError,
      setBackgroundError: stepErrors.setBackgroundError,
      setSpeciesError: stepErrors.setSpeciesError,
      setFeatsError: stepErrors.setFeatsError,
      setSubclassError: stepErrors.setSubclassError,
      classDetail: classDetail.data,
      classProgression: classProgression.data?.data,
      backgroundDetail: backgroundDetail.data,
      speciesTraitChoices: speciesTraits.data?.data,
      subclassOptions: subclassOpts.data?.data,
      originFeatSlug,
      hasFightingStylePick,
      fightingStyleSlugs: classDetail.data?.fightingStyleSlugs ?? [],
      hasFeatsStep,
      hasSubclassStep,
      hasSpellStep,
      hasInvocationsStep: classSlug === "warlock",
      hasMetamagicsStep: classSlug === "sorcerer" && level >= 2,
    });
  }

  function goBack() {
    const prev = prevWizardStep(step, wizardNav);
    if (prev) setStep(prev);
  }

  const stepIndex = visibleSteps.findIndex((item) => item.id === step);
  const isLastStep = step === "review";

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        create.mutate(toCreateCharacterPayload(values));
      })}
    >
      <WizardStepIndicator currentStep={step} navOptions={wizardNav} />

      <WizardStepContent
        step={step}
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        abilitiesError={stepErrors.abilitiesError}
        skillsError={stepErrors.skillsError}
        backgroundError={stepErrors.backgroundError}
        featsError={stepErrors.featsError}
        speciesError={stepErrors.speciesError}
        subclassError={stepErrors.subclassError}
      />

      {create.isError ? <WizardSubmitError error={create.error} /> : null}

      <WizardFooterNav
        showBack={stepIndex > 0}
        isLastStep={isLastStep}
        isSubmitting={create.isPending}
        onBack={goBack}
        onNext={goNext}
        onCancel={() => router.push("/characters")}
      />
    </form>
  );
}
