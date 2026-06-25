"use client";

import { useEffect, useRef } from "react";

import type { BackgroundAbilityMode } from "@/domain/character-sheet/background-details";
import {
  findBackgroundDetails,
  findSpeciesDetails,
} from "@/domain/character-sheet/background-details";
import { findSpeciesDetails as findSpecies } from "@/domain/character-sheet/species-details";
import {
  CHARACTER_ALIGNMENTS,
  findSpeciesName,
  PHB_2024_BACKGROUNDS,
  PHB_2024_SPECIES,
} from "@/domain/character-sheet/origins";
import { SKILL_LABELS_PT } from "@/shared/labels/pt-br";
import { BackgroundAbilityPanel } from "@/presentation/components/character-sheet/background-ability-panel";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { useIdentitySync } from "@/presentation/components/character-sheet/hooks/use-identity-sync";
import {
  SpeciesHeritagePanel,
  SpeciesMetaStrip,
} from "@/presentation/components/character-sheet/species-heritage-panel";
import {
  SheetInput,
  SheetSection,
  SheetSelect,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepIdentity({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const speciesId = watch("species");
  const backgroundId = watch("background");
  const characterClass = watch("characterClass");
  const backgroundMode = watch("backgroundAbilityMode");
  const backgroundPlus2 = watch("backgroundAbilityPlus2");
  const backgroundPlus1 = watch("backgroundAbilityPlus1");
  const speciesSkillChoice = watch("speciesSkillChoice");
  const speciesOriginFeat = watch("speciesOriginFeat");
  const speciesDetails = speciesId ? findSpecies(speciesId) : undefined;
  const backgroundDetails = backgroundId
    ? findBackgroundDetails(backgroundId)
    : undefined;

  useIdentitySync({
    watch,
    setValue,
    speciesId,
    backgroundId,
    characterClass,
    backgroundMode,
    backgroundPlus2,
    backgroundPlus1,
    speciesSkillChoice,
    speciesOriginFeat,
  });

  function handleBackgroundModeChange(mode: BackgroundAbilityMode) {
    setValue("backgroundAbilityMode", mode);
    if (mode === "even") {
      setValue("backgroundAbilityPlus2", "");
      setValue("backgroundAbilityPlus1", "");
    }
  }

  return (
    <SheetSection title="Identidade">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <SheetInput
            label="Nome do personagem"
            className="text-lg font-semibold"
            placeholder="Nome do herói"
            autoFocus
            {...register("characterName")}
          />

          <SheetSelect
            label="Espécie"
            value={speciesId}
            onChange={(value) => setValue("species", value)}
            options={PHB_2024_SPECIES.map((species) => ({
              value: species.id,
              label: species.name,
            }))}
            placeholder="Escolha uma espécie"
          />

          {speciesDetails ? (
            <SpeciesMetaStrip species={speciesDetails} />
          ) : null}

          <SheetSelect
            label="Antecedente"
            value={backgroundId}
            onChange={(value) => setValue("background", value)}
            options={PHB_2024_BACKGROUNDS.map((background) => ({
              value: background.id,
              label: background.name,
            }))}
            placeholder="Escolha um antecedente"
          />

          {backgroundId ? (
            <BackgroundAbilityPanel
              backgroundId={backgroundId}
              mode={backgroundMode}
              plus2={backgroundPlus2}
              plus1={backgroundPlus1}
              onModeChange={handleBackgroundModeChange}
              onPlus2Change={(value) =>
                setValue("backgroundAbilityPlus2", value)
              }
              onPlus1Change={(value) =>
                setValue("backgroundAbilityPlus1", value)
              }
            />
          ) : null}

          {backgroundDetails ? (
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Talento:</span>{" "}
                {backgroundDetails.originFeat}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-foreground">Perícias:</span>{" "}
                {backgroundDetails.skills
                  .map((skill) => SKILL_LABELS_PT[skill])
                  .join(", ")}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-foreground">
                  Ferramentas:
                </span>{" "}
                {backgroundDetails.toolsLabel}
              </p>
            </div>
          ) : null}

          <SheetSelect
            label="Alinhamento"
            value={watch("alignment")}
            onChange={(value) => setValue("alignment", value)}
            options={CHARACTER_ALIGNMENTS.map((alignment) => ({
              value: alignment.id,
              label: alignment.name,
            }))}
            placeholder="Escolha um alinhamento"
          />
        </div>

        {speciesDetails ? (
          <SpeciesHeritagePanel
            species={speciesDetails}
            speciesName={findSpeciesName(speciesId)}
            speciesId={speciesId}
            skillChoice={speciesSkillChoice}
            originFeat={speciesOriginFeat}
            onSkillChoiceChange={(value) =>
              setValue("speciesSkillChoice", value)
            }
            onOriginFeatChange={(value) => setValue("speciesOriginFeat", value)}
          />
        ) : null}
      </div>
    </SheetSection>
  );
}
