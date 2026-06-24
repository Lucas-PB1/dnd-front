"use client";

import {
  CHARACTER_ALIGNMENTS,
  findSpeciesName,
  PHB_2024_BACKGROUNDS,
  PHB_2024_SPECIES,
} from "@/domain/character-sheet/origins";
import {
  findSpeciesDetails,
  getSpeciesSheetDefaults,
} from "@/domain/character-sheet/species-details";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
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
  const speciesDetails = speciesId ? findSpeciesDetails(speciesId) : undefined;

  function handleSpeciesChange(value: string) {
    setValue("species", value);

    const defaults = getSpeciesSheetDefaults(value);
    if (!defaults) {
      return;
    }

    setValue("speed", defaults.speed);
    setValue("size", defaults.size);
    setValue("speciesTraits", defaults.speciesTraits);
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
            onChange={handleSpeciesChange}
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
            value={watch("background")}
            onChange={(value) => setValue("background", value)}
            options={PHB_2024_BACKGROUNDS.map((background) => ({
              value: background.id,
              label: background.name,
            }))}
            placeholder="Escolha um antecedente"
          />

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
          />
        ) : null}
      </div>
    </SheetSection>
  );
}
