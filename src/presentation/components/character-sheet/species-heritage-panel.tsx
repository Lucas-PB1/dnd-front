"use client";

import type { ReactNode } from "react";

import type { SpeciesDefinition } from "@/domain/character-sheet/species-details";
import {
  getSpeciesSkillChoicePool,
  getSpeciesTraitChoicesConfig,
  ORIGIN_FEATS,
  speciesHasOriginFeatChoice,
  speciesHasSkillChoice,
} from "@/domain/character-sheet/species-trait-choices";
import type { SkillKey } from "@/domain/character-sheet/constants";
import { SKILL_LABELS_PT } from "@/domain/character-sheet/skill-labels-pt";
import { SheetSelect } from "@/presentation/components/character-sheet/sheet-primitives";

type SpeciesHeritagePanelProps = {
  species: SpeciesDefinition;
  speciesName: string;
  speciesId: string;
  skillChoice: string;
  originFeat: string;
  onSkillChoiceChange: (value: string) => void;
  onOriginFeatChange: (value: string) => void;
};

function HeritageItem({
  title,
  children,
  action,
}: {
  title: string;
  children: string;
  action?: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-2">
      <div>
        <strong className="block text-sm font-semibold text-foreground">
          {title}
        </strong>
        <span className="text-sm text-muted-foreground">{children}</span>
      </div>
      {action}
    </li>
  );
}

export function SpeciesHeritagePanel({
  species,
  speciesName,
  speciesId,
  skillChoice,
  originFeat,
  onSkillChoiceChange,
  onOriginFeatChange,
}: SpeciesHeritagePanelProps) {
  const choicesConfig = getSpeciesTraitChoicesConfig(speciesId);
  const skillPool = getSpeciesSkillChoicePool(speciesId);
  const skillOptions = skillPool.map((skill) => ({
    value: skill,
    label: SKILL_LABELS_PT[skill],
  }));

  return (
    <aside className="rounded-xl border border-primary/20 bg-muted/30 p-4 lg:max-w-sm">
      <h4 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        Traços de {speciesName}
      </h4>
      <ul className="flex flex-col gap-4">
        {species.traits.map((trait) => {
          const isSkillTrait =
            choicesConfig?.skillChoice?.traitTitle === trait.title;
          const isFeatTrait =
            choicesConfig?.originFeatChoice && trait.title === "Versátil";

          return (
            <HeritageItem
              key={trait.title}
              title={trait.title}
              action={
                isSkillTrait && speciesHasSkillChoice(speciesId) ? (
                  <SheetSelect
                    label="Perícia"
                    value={skillChoice}
                    onChange={onSkillChoiceChange}
                    options={skillOptions}
                    placeholder="Escolha uma perícia"
                  />
                ) : isFeatTrait && speciesHasOriginFeatChoice(speciesId) ? (
                  <SheetSelect
                    label="Talento de Origem"
                    value={originFeat}
                    onChange={onOriginFeatChange}
                    options={ORIGIN_FEATS.map((feat) => ({
                      value: feat,
                      label: feat,
                    }))}
                    placeholder="Habilidoso (recomendado)"
                  />
                ) : null
              }
            >
              {isSkillTrait && skillChoice
                ? `Proficiência em ${SKILL_LABELS_PT[skillChoice as SkillKey]}.`
                : isFeatTrait && originFeat
                  ? `Talento de Origem: ${originFeat}.`
                  : trait.summary}
            </HeritageItem>
          );
        })}
      </ul>
    </aside>
  );
}

export function SpeciesMetaStrip({ species }: { species: SpeciesDefinition }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Resumo da espécie">
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {species.creatureType}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        Desloc. {species.speedLabel}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {species.sizeLabel}
      </span>
    </div>
  );
}
