"use client";

import type { SpeciesChoice } from "@/entities/character/sheet-types";
import type { SpeciesTraitChoiceGroup } from "@/features/character/create-character/lib/species/use-step-species-choices";
import { SpeciesTraitChoiceField } from "@/features/character/create-character/ui/steps/species/species-trait-choice-field";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { FieldError } from "@/shared/ui/field";

type SpeciesTraitChoicesSectionProps = {
  groups: SpeciesTraitChoiceGroup[];
  speciesChoices: SpeciesChoice[];
  skillKinds: ReadonlySet<string>;
  grantedSkillSlugs: string[];
  error?: string;
  onSelect: (kind: string, slug: string) => void;
};

export function SpeciesTraitChoicesSection({
  groups,
  speciesChoices,
  skillKinds,
  grantedSkillSlugs,
  error,
  onSelect,
}: SpeciesTraitChoicesSectionProps) {
  return (
    <WizardFormSection title="Traços" compact>
      <FieldError errors={error ? [{ message: error }] : []} />
      <div className="space-y-4">
        {groups.map((group) => {
          const selected = speciesChoices.find(
            (c) => c.choiceKind === group.kind,
          )?.choiceSlug;

          return (
            <SpeciesTraitChoiceField
              key={group.kind}
              group={group}
              selected={selected}
              isSkillChoice={skillKinds.has(group.kind)}
              grantedSkillSlugs={grantedSkillSlugs}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
