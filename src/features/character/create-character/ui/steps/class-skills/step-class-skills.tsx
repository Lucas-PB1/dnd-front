"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import { useStepClassSkills } from "@/features/character/create-character/lib/class-skills/use-step-class-skills";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { ClassExpertiseSection } from "@/features/character/create-character/ui/steps/class-skills/class-expertise-section";
import { ClassSkillsPickerSection } from "@/features/character/create-character/ui/steps/class-skills/class-skills-picker-section";
import { ClassWeaponMasterySection } from "@/features/character/create-character/ui/steps/class-skills/class-weapon-mastery-section";
import { FieldError } from "@/shared/ui/field";

type StepClassSkillsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepClassSkills({
  control,
  setValue,
  error,
}: StepClassSkillsProps) {
  const data = useStepClassSkills(control, setValue);

  if (!data.classSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Volte à identidade e escolha uma classe.
      </p>
    );
  }

  if (data.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando perícias…</p>
    );
  }

  return (
    <div className="space-y-4">
      {data.showSkillPicker ? (
        <ClassSkillsPickerSection
          options={data.options}
          classSkillSlugs={data.classSkillSlugs}
          backgroundSkillSlugs={data.backgroundSkillSlugs}
          requiredCount={data.requiredCount}
          atLimit={data.atLimit}
          error={error}
          onToggleSkill={data.toggleSkill}
        />
      ) : (
        <FieldError errors={error ? [{ message: error }] : []} />
      )}

      <ClassExpertiseSection
        expertiseSlots={data.expertiseSlots}
        expertiseCandidates={data.expertiseCandidates}
        classOptions={data.classOptions}
        expertiseFilled={data.expertiseFilled}
        onSetExpertise={data.setExpertise}
      />

      <ClassWeaponMasterySection
        masterySlots={data.masterySlots}
        masteryCandidates={data.masteryCandidates}
        classOptions={data.classOptions}
        masteryFilled={data.masteryFilled}
        masteryEligibility={data.masteryEligibility}
        onSetMasteryWeapon={data.setMasteryWeapon}
      />
    </div>
  );
}
