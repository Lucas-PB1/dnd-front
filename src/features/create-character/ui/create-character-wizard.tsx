"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useClassDetail,
  useSubclassOptions,
} from "@/features/class-catalog/api/use-classes";
import { useCreateCharacter } from "@/features/create-character/api/use-create-character";
import { DEFAULT_ABILITY_SCORES } from "@/features/create-character/lib/point-buy";
import {
  abilitiesStepSchema,
  createCharacterSchema,
  identityStepSchema,
  type CreateCharacterInput,
} from "@/features/create-character/model/create-character.schema";
import { toCreateCharacterPayload } from "@/features/create-character/model/to-create-payload";
import {
  prevWizardStep,
  WIZARD_STEPS,
  type WizardStepId,
  wizardStepIndex,
} from "@/features/create-character/model/wizard-steps";
import { StepAbilities } from "@/features/create-character/ui/steps/step-abilities";
import { StepBackground } from "@/features/create-character/ui/steps/step-background";
import { StepClassSkills } from "@/features/create-character/ui/steps/step-class-skills";
import { StepEquipment } from "@/features/create-character/ui/steps/step-equipment";
import { StepIdentity } from "@/features/create-character/ui/steps/step-identity";
import { StepReview } from "@/features/create-character/ui/steps/step-review";
import { StepSpeciesChoices } from "@/features/create-character/ui/steps/step-species-choices";
import { StepSpells } from "@/features/create-character/ui/steps/step-spells";
import { StepSubclassOptions } from "@/features/create-character/ui/steps/step-subclass-options";
import { WizardStepIndicator } from "@/features/create-character/ui/wizard-step-indicator";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import { Button } from "@/shared/ui/button";

const DEFAULT_VALUES: CreateCharacterInput = {
  name: "",
  level: 1,
  classSlug: "",
  speciesSlug: "",
  backgroundSlug: "",
  subclassSlug: "",
  abilityGenerationMethodSlug: "standard-array",
  abilityScores: { ...DEFAULT_ABILITY_SCORES },
  backgroundAbilityBoostPlus2Slug: "",
  backgroundAbilityBoostPlus1Slug: "",
  backgroundToolItemSlug: "",
  classSkillSlugs: [],
  abilityRawValues: undefined,
  speciesChoices: [],
  subclassOptions: [],
  equipment: [],
  characterSpells: [],
};

export function CreateCharacterWizard() {
  const router = useRouter();
  const create = useCreateCharacter();
  const [step, setStep] = useState<WizardStepId>("identity");
  const [skillsError, setSkillsError] = useState<string | undefined>();
  const [abilitiesError, setAbilitiesError] = useState<string | undefined>();
  const [speciesError, setSpeciesError] = useState<string | undefined>();
  const [subclassError, setSubclassError] = useState<string | undefined>();
  const [backgroundError, setBackgroundError] = useState<string | undefined>();

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
    defaultValues: DEFAULT_VALUES,
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

  const prevClassSlugRef = useRef(classSlug);
  const prevSpeciesSlugRef = useRef(speciesSlug);
  const prevSubclassSlugRef = useRef(subclassSlug);
  const prevBackgroundSlugRef = useRef(backgroundSlug);

  useEffect(() => {
    if (prevBackgroundSlugRef.current !== backgroundSlug) {
      setValue("backgroundAbilityBoostPlus2Slug", "");
      setValue("backgroundAbilityBoostPlus1Slug", "");
      setValue("backgroundToolItemSlug", "");
      prevBackgroundSlugRef.current = backgroundSlug;
    }
  }, [backgroundSlug, setValue]);

  useEffect(() => {
    if (prevClassSlugRef.current !== classSlug) {
      setValue("classSkillSlugs", []);
      setValue(
        "equipment",
        (getValues("equipment") ?? []).filter((e) => e.source !== "class"),
      );
      setValue("characterSpells", []);
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

  async function goNext() {
    setSkillsError(undefined);
    setAbilitiesError(undefined);
    setSpeciesError(undefined);
    setSubclassError(undefined);
    setBackgroundError(undefined);

    if (step === "identity") {
      const valid = await trigger([
        "name",
        "level",
        "classSlug",
        "speciesSlug",
        "backgroundSlug",
        "subclassSlug",
      ]);
      if (!valid) return;
      if (!identityStepSchema.safeParse(getValues()).success) return;
      setStep("abilities");
      return;
    }

    if (step === "abilities") {
      const values = getValues();
      if (!abilitiesStepSchema.safeParse(values).success) return;

      if (values.abilityGenerationMethodSlug !== "point-buy") {
        if (!values.abilityRawValues?.length) {
          setAbilitiesError("Gere os valores antes de continuar.");
          return;
        }
      } else {
        const ok = await trigger("abilityScores");
        if (!ok) return;
      }

      const boostOk = await trigger([
        "backgroundAbilityBoostPlus2Slug",
        "backgroundAbilityBoostPlus1Slug",
      ]);
      if (!boostOk) {
        setAbilitiesError("Escolha os bônus +2 e +1 do antecedente.");
        return;
      }

      setStep("skills");
      return;
    }

    if (step === "skills") {
      const values = getValues();
      const required = classDetail.data?.skillChoiceCount ?? 0;
      if (required > 0 && values.classSkillSlugs.length !== required) {
        setSkillsError(`Escolha exatamente ${required} perícia(s).`);
        return;
      }
      setStep("background");
      return;
    }

    if (step === "background") {
      const values = getValues();
      const bg = backgroundDetail.data;
      if (!bg) {
        setBackgroundError("Carregue o antecedente antes de continuar.");
        return;
      }
      if (
        bg.toolProficiencyKind === "choice" &&
        !values.backgroundToolItemSlug?.trim()
      ) {
        setBackgroundError("Escolha a ferramenta do antecedente.");
        return;
      }
      setStep("species");
      return;
    }

    if (step === "species") {
      const values = getValues();
      const requiredKinds = [
        ...new Set((speciesTraits.data?.data ?? []).map((r) => r.choiceKind)),
      ];
      if (requiredKinds.length > 0) {
        const provided = values.speciesChoices.map((c) => c.choiceKind);
        const missing = requiredKinds.filter((k) => !provided.includes(k));
        if (missing.length > 0) {
          setSpeciesError("Complete todas as escolhas de traço da espécie.");
          return;
        }
      }
      setStep("subclass");
      return;
    }

    if (step === "subclass") {
      const values = getValues();
      const requiredOptions = subclassOpts.data?.data ?? [];
      if (requiredOptions.length > 0) {
        const provided = new Set(
          values.subclassOptions.map((o) => o.optionKey),
        );
        const missing = requiredOptions.filter(
          (o) => !provided.has(o.optionKey),
        );
        if (missing.length > 0) {
          setSubclassError("Selecione todas as opções de subclasse.");
          return;
        }
      }
      setStep("equipment");
      return;
    }

    if (step === "equipment") {
      setStep("spells");
      return;
    }

    if (step === "spells") {
      setStep("review");
      return;
    }
  }

  function goBack() {
    const prev = prevWizardStep(step);
    if (prev) setStep(prev);
  }

  const stepIndex = wizardStepIndex(step);
  const isLastStep = step === "review";

  return (
    <form
      className="flex max-w-lg flex-col gap-6"
      onSubmit={handleSubmit((values) => {
        create.mutate(toCreateCharacterPayload(values));
      })}
    >
      <WizardStepIndicator currentStep={step} />

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

      {step === "species" ? (
        <>
          <StepSpeciesChoices
            control={control}
            setValue={setValue}
            error={speciesError}
          />
        </>
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

      {step === "review" ? <StepReview control={control} /> : null}

      {create.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {create.error instanceof Error
            ? create.error.message
            : "Erro ao criar ficha"}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {stepIndex > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={goBack}>
            Voltar
          </Button>
        ) : null}

        {!isLastStep ? (
          <Button type="button" size="lg" onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={create.isPending}>
            {create.isPending ? "Criando…" : "Criar ficha"}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push("/characters")}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Etapa {stepIndex + 1} de {WIZARD_STEPS.length} — a dnd-api valida
        atributos, perícias e calcula PV/PB.
      </p>
    </form>
  );
}
