import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import type { WizardStepId } from "@/features/character/create-character/model/wizard-steps";
import { StepAbilities } from "@/features/character/create-character/ui/steps/abilities/step-abilities";
import { StepBackground } from "@/features/character/create-character/ui/steps/background/step-background";
import { StepClassSkills } from "@/features/character/create-character/ui/steps/class-skills/step-class-skills";
import { StepEquipment } from "@/features/character/create-character/ui/steps/equipment/step-equipment";
import { StepFeats } from "@/features/character/create-character/ui/steps/feats/step-feats";
import { StepIdentity } from "@/features/character/create-character/ui/steps/identity/step-identity";
import { StepLanguages } from "@/features/character/create-character/ui/steps/languages/step-languages";
import { StepReview } from "@/features/character/create-character/ui/steps/review/step-review";
import { StepSpeciesChoices } from "@/features/character/create-character/ui/steps/species/step-species-choices";
import { StepSpells } from "@/features/character/create-character/ui/steps/spells/step-spells";
import { StepWarlockInvocations } from "@/features/character/create-character/ui/steps/invocations/step-warlock-invocations";
import { StepSubclassOptions } from "@/features/character/create-character/ui/steps/subclass/step-subclass-options";

type WizardStepContentProps = {
  step: WizardStepId;
  register: UseFormRegister<CreateCharacterInput>;
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  abilitiesError: string | undefined;
  skillsError: string | undefined;
  backgroundError: string | undefined;
  featsError: string | undefined;
  speciesError: string | undefined;
  subclassError: string | undefined;
};

function StepInlineError({ message }: { message: string }) {
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function WizardStepContent({
  step,
  register,
  control,
  errors,
  setValue,
  abilitiesError,
  skillsError,
  backgroundError,
  featsError,
  speciesError,
  subclassError,
}: WizardStepContentProps) {
  return (
    <div
      key={step}
      className="animate-in fade-in-0 slide-in-from-right-3 duration-300 fill-mode-both"
    >
      {step === "identity" ? (
        <StepIdentity register={register} control={control} errors={errors} />
      ) : null}

      {step === "abilities" ? (
        <>
          <StepAbilities control={control} errors={errors} setValue={setValue} />
          {abilitiesError ? <StepInlineError message={abilitiesError} /> : null}
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
          <StepBackground control={control} errors={errors} setValue={setValue} />
          {backgroundError ? (
            <StepInlineError message={backgroundError} />
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

      {step === "invocations" ? (
        <>
          <StepWarlockInvocations control={control} setValue={setValue} />
          {subclassError ? <StepInlineError message={subclassError} /> : null}
        </>
      ) : null}

      {step === "languages" ? (
        <StepLanguages control={control} setValue={setValue} />
      ) : null}

      {step === "review" ? <StepReview control={control} /> : null}
    </div>
  );
}
