"use client";

import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { AbilityGenerationFields } from "@/features/create-character/ui/steps/ability-generation-fields";
import { WizardBackgroundBoostSection } from "@/features/create-character/ui/steps/wizard-background-boost-section";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";

type StepAbilitiesProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepAbilities({
  control,
  errors,
  setValue,
}: StepAbilitiesProps) {
  return (
    <div className="space-y-3">
      <AbilityGenerationFields
        control={control}
        errors={errors}
        setValue={setValue}
      />
      <WizardBackgroundBoostSection
        control={control}
        errors={errors}
        setValue={setValue}
      />
    </div>
  );
}
