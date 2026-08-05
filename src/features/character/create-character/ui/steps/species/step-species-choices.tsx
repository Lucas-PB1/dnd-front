"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import { useStepSpeciesChoices } from "@/features/character/create-character/lib/species/use-step-species-choices";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { SpeciesFeatOptionsSection } from "@/features/character/create-character/ui/steps/species/species-feat-options-section";
import { SpeciesTraitChoicesSection } from "@/features/character/create-character/ui/steps/species/species-trait-choices-section";

type StepSpeciesChoicesProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
  /** Slug da ficha — fallback se o watch ainda não hidratou. */
  lockedSpeciesSlug?: string;
};

export function StepSpeciesChoices({
  control,
  setValue,
  error,
  lockedSpeciesSlug,
}: StepSpeciesChoicesProps) {
  const data = useStepSpeciesChoices(
    control,
    setValue,
    lockedSpeciesSlug,
  );

  if (!data.speciesSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        {lockedSpeciesSlug
          ? "Não foi possível carregar a espécie desta ficha."
          : "Volte à identidade e escolha uma espécie."}
      </p>
    );
  }

  if (data.traitChoices.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando traços…</p>;
  }

  if (data.groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta espécie não exige escolhas de traço.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <SpeciesTraitChoicesSection
        groups={data.groups}
        speciesChoices={data.speciesChoices}
        skillKinds={data.skillKinds}
        grantedSkillSlugs={data.grantedSkillSlugs}
        error={error}
        onSelect={data.setChoice}
      />

      <SpeciesFeatOptionsSection
        previewFeats={data.previewFeats}
        humanOriginFeatKeys={data.humanOriginFeatKeys}
        featNameBySlug={data.featNameBySlug}
        featOptions={data.featOptions}
        level={data.level}
        classSlug={data.classSlug}
        grantedSkillSlugs={data.grantedSkillSlugs}
        grantedToolSlugs={data.grantedToolSlugs}
        onChange={data.setFeatOptions}
      />
    </div>
  );
}
