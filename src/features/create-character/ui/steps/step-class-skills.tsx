"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  useClassDetail,
  useClassSkills,
} from "@/features/class-catalog/api/use-classes";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { FieldError } from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

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
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const classSkillSlugs = useWatch({
    control,
    name: "classSkillSlugs",
    defaultValue: [],
  });

  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSkills = useClassSkills(classSlug, !!classSlug);

  const requiredCount = classDetail.data?.skillChoiceCount ?? 0;
  const options = classSkills.data?.data ?? [];
  const atLimit = requiredCount > 0 && classSkillSlugs.length >= requiredCount;

  function toggleSkill(slug: string) {
    const selected = classSkillSlugs.includes(slug);
    if (selected) {
      setValue(
        "classSkillSlugs",
        classSkillSlugs.filter((s) => s !== slug),
      );
      return;
    }
    if (requiredCount > 0 && classSkillSlugs.length >= requiredCount) {
      return;
    }
    setValue("classSkillSlugs", [...classSkillSlugs, slug]);
  }

  if (!classSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Volte à identidade e escolha uma classe.
      </p>
    );
  }

  if (classSkills.isPending || classDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando perícias…</p>
    );
  }

  if (requiredCount === 0 || options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {classDetail.data?.name ?? classSlug} não exige perícias à escolha.
      </p>
    );
  }

  return (
    <WizardFormSection
      title={`Perícias · ${classSkillSlugs.length}/${requiredCount}`}
      compact
    >
      <FieldError errors={error ? [{ message: error }] : []} />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((skill) => {
          const checked = classSkillSlugs.includes(skill.slug);
          const disabled = !checked && atLimit;

          return (
            <li key={skill.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
                  checked && "border-primary bg-primary/5",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleSkill(skill.slug)}
                  className="size-4 rounded border-input"
                />
                <span>{skill.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </WizardFormSection>
  );
}
