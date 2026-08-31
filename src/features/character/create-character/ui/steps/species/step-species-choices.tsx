"use client";

import type { Control, UseFormSetValue } from "react-hook-form";

import { useStepSpeciesChoices } from "@/features/character/create-character/lib/species/use-step-species-choices";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { OriginPreview } from "@/features/character/create-character/ui/origin-preview";
import { HeritageTraditionalTraitsPanel } from "@/features/character/create-character/ui/steps/species/heritage-traditional-traits-panel";
import { SpeciesFeatOptionsSection } from "@/features/character/create-character/ui/steps/species/species-feat-options-section";
import { SpeciesTraitChoicesSection } from "@/features/character/create-character/ui/steps/species/species-trait-choices-section";

type StepSpeciesChoicesProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
  /** Slug da ficha — fallback se o watch ainda não hidratou. */
  lockedSpeciesSlug?: string;
  lockedHeritageSlug?: string;
};

export function StepSpeciesChoices({
  control,
  setValue,
  error,
  lockedSpeciesSlug,
  lockedHeritageSlug,
}: StepSpeciesChoicesProps) {
  const data = useStepSpeciesChoices(
    control,
    setValue,
    lockedSpeciesSlug,
    lockedHeritageSlug,
  );

  if (!data.speciesSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        {lockedSpeciesSlug || lockedHeritageSlug
          ? "Não foi possível carregar a origem desta ficha."
          : "Volte à identidade e escolha uma espécie ou variante."}
      </p>
    );
  }

  if (data.traitChoices.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando traços…</p>;
  }

  const heritageHasCustomChoices = data.groups.length > 0;
  const heritageReady =
    !data.isHeritageOrigin || data.traditionalTraits.length > 0;

  return (
    <div className="space-y-3">
      <OriginPreview
        speciesSlug={data.isHeritageOrigin ? undefined : data.speciesSlug}
        heritageSlug={data.heritageSlug || undefined}
        level={data.level}
      />

      {data.isHeritageOrigin ? (
        <>
          <HeritageTraditionalTraitsPanel
            traits={data.traditionalTraits}
            selectedTraitSlugs={data.heritageTraitSlugs}
            onDoubleChange={data.setTraditionalTraitDouble}
            onClearDouble={data.clearTraditionalTraitDoubleChoice}
            onReplaceChange={data.changeTraditionalTraitReplace}
          />
          {heritageHasCustomChoices ? (
            <SpeciesTraitChoicesSection
              groups={data.groups}
              speciesChoices={data.speciesChoices}
              skillKinds={data.skillKinds}
              grantedSkillSlugs={data.grantedSkillSlugs}
              error={error}
              onSelect={data.setChoice}
            />
          ) : null}
          {!heritageReady ? (
            <p className="text-sm text-muted-foreground">
              Esta variante não tem build tradicional cadastrado.
            </p>
          ) : null}
        </>
      ) : data.groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Esta espécie não exige escolhas de traço.
        </p>
      ) : (
        <SpeciesTraitChoicesSection
          groups={data.groups}
          speciesChoices={data.speciesChoices}
          skillKinds={data.skillKinds}
          grantedSkillSlugs={data.grantedSkillSlugs}
          error={error}
          onSelect={data.setChoice}
        />
      )}

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
