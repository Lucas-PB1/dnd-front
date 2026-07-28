"use client";

import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { FieldError } from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

type SkillOption = {
  slug: string;
  name: string;
};

type ClassSkillsPickerSectionProps = {
  options: SkillOption[];
  classSkillSlugs: string[];
  backgroundSkillSlugs: Set<string>;
  requiredCount: number;
  atLimit: boolean;
  error?: string;
  onToggleSkill: (slug: string) => void;
};

export function ClassSkillsPickerSection({
  options,
  classSkillSlugs,
  backgroundSkillSlugs,
  requiredCount,
  atLimit,
  error,
  onToggleSkill,
}: ClassSkillsPickerSectionProps) {
  return (
    <WizardFormSection
      title={`Perícias · ${classSkillSlugs.length}/${requiredCount}`}
      compact
    >
      <FieldError errors={error ? [{ message: error }] : []} />
      {backgroundSkillSlugs.size > 0 ? (
        <p className="text-xs text-muted-foreground">
          Perícias do antecedente já estão concedidas — escolha outras.
        </p>
      ) : null}
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((skill) => {
          const fromBackground = backgroundSkillSlugs.has(skill.slug);
          const checked = classSkillSlugs.includes(skill.slug);
          const disabled = fromBackground || (!checked && atLimit);

          return (
            <li key={skill.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
                  checked && "border-primary bg-primary/5",
                  fromBackground && "border-muted bg-muted/40",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked || fromBackground}
                  disabled={disabled}
                  onChange={() => onToggleSkill(skill.slug)}
                  className="size-4 rounded border-input"
                />
                <span>
                  {skill.name}
                  {fromBackground ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      · antecedente
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </WizardFormSection>
  );
}
