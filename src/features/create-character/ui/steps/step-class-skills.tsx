"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  useClassDetail,
  useClassSkills,
} from "@/features/class-catalog/api/use-classes";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
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
        Volte à etapa de identidade e escolha uma classe.
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
        A classe <strong>{classDetail.data?.name ?? classSlug}</strong> não
        exige escolha de perícias adicionais.
      </p>
    );
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Perícias de classe</FieldLabel>
        <FieldDescription>
          Escolha {requiredCount} perícia{requiredCount === 1 ? "" : "s"} da
          pool de {classDetail.data?.name ?? classSlug}.
          {classDetail.data?.skillChoiceFrom
            ? ` (${classDetail.data.skillChoiceFrom})`
            : null}
        </FieldDescription>
        <p className="text-sm text-muted-foreground">
          Selecionadas: {classSkillSlugs.length} / {requiredCount}
        </p>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((skill) => {
          const checked = classSkillSlugs.includes(skill.slug);
          const disabled = !checked && atLimit;

          return (
            <li key={skill.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
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
    </FieldGroup>
  );
}
