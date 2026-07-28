"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useClassDetail,
  useClassProgression,
  useSubclassOptions,
} from "@/features/class-catalog/api/use-classes";
import { useCreateCharacter } from "@/features/create-character/api/use-create-character";
import { advanceWizardStep } from "@/features/create-character/lib/advance-wizard-step";
import { CREATE_CHARACTER_DEFAULT_VALUES } from "@/features/create-character/lib/create-character-defaults";
import {
  createCharacterSchema,
  type CreateCharacterInput,
  SUBCLASS_REQUIRED_FROM_LEVEL,
} from "@/features/create-character/model/create-character.schema";
import { toCreateCharacterPayload } from "@/features/create-character/model/to-create-payload";
import {
  prevWizardStep,
  visibleWizardSteps,
  type WizardNavOptions,
  type WizardStepId,
} from "@/features/create-character/model/wizard-steps";
import { useWizardHasSubclassStep } from "@/features/create-character/api/use-wizard-has-subclass-step";
import { useWizardHasSpellStep } from "@/features/create-character/api/use-wizard-has-spell-step";
import { StepAbilities } from "@/features/create-character/ui/steps/step-abilities";
import { StepBackground } from "@/features/create-character/ui/steps/step-background";
import { StepClassSkills } from "@/features/create-character/ui/steps/step-class-skills";
import { StepEquipment } from "@/features/create-character/ui/steps/step-equipment";
import { StepFeats } from "@/features/create-character/ui/steps/step-feats";
import { StepIdentity } from "@/features/create-character/ui/steps/step-identity";
import { StepLanguages } from "@/features/create-character/ui/steps/step-languages";
import { StepReview } from "@/features/create-character/ui/steps/step-review";
import { StepSpeciesChoices } from "@/features/create-character/ui/steps/step-species-choices";
import { StepSpells } from "@/features/create-character/ui/steps/step-spells";
import { StepSubclassOptions } from "@/features/create-character/ui/steps/step-subclass-options";
import { WizardStepIndicator } from "@/features/create-character/ui/wizard-step-indicator";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import { countAsiFeatSlots } from "@/features/create-character/lib/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import { resolveCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";
import { ritualSpellSlotIndex } from "@/features/create-character/lib/feat-option-requirements";
import { proficiencyBonusForLevel } from "@/features/create-character/lib/proficiency-bonus-for-level";
import { TempTestPresetsPanel } from "@/features/create-character/ui/temp-test-presets-panel";
import { Button } from "@/shared/ui/button";

export function CreateCharacterWizard() {
  const router = useRouter();
  const create = useCreateCharacter();
  const [step, setStep] = useState<WizardStepId>("identity");
  const [skillsError, setSkillsError] = useState<string | undefined>();
  const [abilitiesError, setAbilitiesError] = useState<string | undefined>();
  const [speciesError, setSpeciesError] = useState<string | undefined>();
  const [subclassError, setSubclassError] = useState<string | undefined>();
  const [backgroundError, setBackgroundError] = useState<string | undefined>();
  const [featsError, setFeatsError] = useState<string | undefined>();

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
  };
  const visibleSteps = visibleWizardSteps(wizardNav);

  const prevClassSlugRef = useRef(classSlug);
  const prevSpeciesSlugRef = useRef(speciesSlug);
  const prevSubclassSlugRef = useRef(subclassSlug);
  const prevBackgroundSlugRef = useRef(backgroundSlug);

  useEffect(() => {
    if (level < SUBCLASS_REQUIRED_FROM_LEVEL) {
      setValue("subclassSlug", "");
      setValue("subclassOptions", []);
    }
  }, [level, setValue]);

  useEffect(() => {
    if (prevBackgroundSlugRef.current !== backgroundSlug) {
      setValue("backgroundAbilityBoostMode", "plus2plus1");
      setValue("backgroundAbilityBoostPlus2Slug", "");
      setValue("backgroundAbilityBoostPlus1Slug", "");
      setValue("backgroundAbilityBoostPlus1Slugs", ["", "", ""]);
      setValue("backgroundToolItemSlug", "");
      setValue("featOptions", []);
      setValue("asiFeatSlotSlugs", []);
      setValue("classSkillSlugs", []);
      setValue("languageSlugs", []);
      prevBackgroundSlugRef.current = backgroundSlug;
    }
  }, [backgroundSlug, setValue]);

  useEffect(() => {
    if (prevClassSlugRef.current !== classSlug) {
      setValue("classSkillSlugs", []);
      setValue("classOptions", []);
      setValue("subclassSlug", "");
      setValue("subclassOptions", []);
      setValue(
        "equipment",
        (getValues("equipment") ?? []).filter((e) => e.source !== "class"),
      );
      setValue("characterSpells", []);
      setValue("fightingStyleFeatSlug", "");
      prevClassSlugRef.current = classSlug;
    }
  }, [classSlug, setValue, getValues]);

  useEffect(() => {
    if (prevSpeciesSlugRef.current !== speciesSlug) {
      setValue("speciesChoices", []);
      prevSpeciesSlugRef.current = speciesSlug;
    }
  }, [speciesSlug, setValue]);

  useEffect(() => {
    if (prevSubclassSlugRef.current !== subclassSlug) {
      setValue("subclassOptions", []);
      prevSubclassSlugRef.current = subclassSlug;
    }
  }, [subclassSlug, setValue]);

  useEffect(() => {
    const count = countAsiFeatSlots(classSlug, level);
    const slots = getValues("asiFeatSlotSlugs") ?? [];
    if (slots.length > count) {
      setValue("asiFeatSlotSlugs", slots.slice(0, count));
      const preview = resolveCreateCharacterFeats(
        backgroundDetail.data?.originFeatSlug ?? null,
        asiFeatSlotsToCharacterFeats(slots.slice(0, count)),
        getValues("speciesChoices") ?? [],
      );
      const keys = new Set(
        preview.map((f) => `${f.featSlug}:${f.instanceIndex}`),
      );
      setValue(
        "featOptions",
        (getValues("featOptions") ?? []).filter((option) => {
          if (!keys.has(`${option.featSlug}:${option.instanceIndex}`)) {
            return false;
          }
          const slot = ritualSpellSlotIndex(option.optionKey);
          if (slot === null) return true;
          return slot <= proficiencyBonusForLevel(level);
        }),
      );
    }
  }, [level, classSlug, setValue, getValues, backgroundDetail.data?.originFeatSlug]);

  async function goNext() {
    await advanceWizardStep({
      step,
      getValues,
      trigger,
      setStep,
      clearStepErrors: () => {
        setSkillsError(undefined);
        setAbilitiesError(undefined);
        setSpeciesError(undefined);
        setSubclassError(undefined);
        setBackgroundError(undefined);
        setFeatsError(undefined);
      },
      setAbilitiesError,
      setSkillsError,
      setBackgroundError,
      setSpeciesError,
      setFeatsError,
      setSubclassError,
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

      {process.env.NODE_ENV === "development" ? (
        <TempTestPresetsPanel wizard={{ setValue, setStep }} />
      ) : null}

      <div
        key={step}
        className="animate-in fade-in-0 slide-in-from-right-3 duration-300 fill-mode-both"
      >
        {step === "identity" ? (
          <StepIdentity register={register} control={control} errors={errors} />
        ) : null}

        {step === "abilities" ? (
          <>
            <StepAbilities
              control={control}
              errors={errors}
              setValue={setValue}
            />
            {abilitiesError ? (
              <p className="text-sm text-destructive" role="alert">
                {abilitiesError}
              </p>
            ) : null}
          </>
        ) : null}

        {step === "skills" ? (
          <StepClassSkills
            control={control}
            setValue={setValue}
            error={skillsError}
          />
        ) : null}

        {step === "background" ? (
          <>
            <StepBackground
              control={control}
              errors={errors}
              setValue={setValue}
            />
            {backgroundError ? (
              <p className="text-sm text-destructive" role="alert">
                {backgroundError}
              </p>
            ) : null}
          </>
        ) : null}

        {step === "feats" ? (
          <StepFeats control={control} setValue={setValue} error={featsError} />
        ) : null}

        {step === "species" ? (
          <StepSpeciesChoices
            control={control}
            setValue={setValue}
            error={speciesError}
          />
        ) : null}

        {step === "subclass" ? (
          <StepSubclassOptions
            control={control}
            setValue={setValue}
            error={subclassError}
          />
        ) : null}

        {step === "equipment" ? (
          <StepEquipment control={control} setValue={setValue} />
        ) : null}

        {step === "spells" ? (
          <StepSpells control={control} setValue={setValue} />
        ) : null}

        {step === "languages" ? (
          <StepLanguages control={control} setValue={setValue} />
        ) : null}

        {step === "review" ? <StepReview control={control} /> : null}
      </div>

      {create.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {create.error instanceof Error
            ? create.error.message
            : "Não foi possível criar a ficha. Tente de novo."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {stepIndex > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            Voltar
          </Button>
        ) : null}

        {!isLastStep ? (
          <Button type="button" onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Criando ficha…" : "Criar ficha"}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/characters")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
