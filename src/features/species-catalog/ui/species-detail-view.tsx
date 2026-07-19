"use client";

import { Suspense, useMemo } from "react";

import { shortSpeciesSize } from "@/entities/species/short-size";
import type {
  SpeciesSummary,
  SpeciesTrait,
  SpeciesTraitChoice,
} from "@/entities/species/types";
import {
  useSpeciesDetail,
  useSpeciesTraitChoices,
  useSpeciesTraits,
} from "@/features/species-catalog/api/use-species";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type SpeciesDetailViewProps = {
  slug: string;
};

function SpeciesHero({
  species,
  backHref,
}: {
  species: SpeciesSummary;
  backHref: string;
}) {
  const stats = [
    { label: "Tipo", value: species.creatureType },
    { label: "Tamanho", value: shortSpeciesSize(species.size) },
    { label: "Deslocamento", value: species.speed },
  ];

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Espécies"
      title={species.name}
      eyebrow={species.tagline}
      summary={species.summary}
      stats={stats}
    />
  );
}

function groupChoicesByTrait(choices: SpeciesTraitChoice[]) {
  const map = new Map<string, SpeciesTraitChoice[]>();
  for (const choice of choices) {
    const list = map.get(choice.traitName) ?? [];
    list.push(choice);
    map.set(choice.traitName, list);
  }
  return [...map.entries()];
}

function TraitChoiceBlock({ choices }: { choices: SpeciesTraitChoice[] }) {
  return (
    <ul className="space-y-4">
      {choices.map((choice) => (
        <li
          key={choice.choiceSlug}
          className="space-y-1 border-l-2 border-border pl-3"
        >
          <p className="font-medium text-foreground">{choice.choiceName}</p>
          {choice.level1Benefit ? (
            <PhbProse
              text={choice.level1Benefit}
              className="text-sm text-muted-foreground"
            />
          ) : null}
          {(choice.spellLevel3Slug || choice.spellLevel5Slug) && (
            <p className="text-xs text-muted-foreground">
              {[
                choice.spellLevel3Slug
                  ? `Nv. 3: ${choice.spellLevel3Slug}`
                  : null,
                choice.spellLevel5Slug
                  ? `Nv. 5: ${choice.spellLevel5Slug}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {choice.damageType ? (
            <p className="text-xs text-muted-foreground">
              Dano: {choice.damageType}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function SpeciesDetailView({ slug }: SpeciesDetailViewProps) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <SpeciesDetailBody slug={slug} />
    </Suspense>
  );
}

function SpeciesDetailBody({ slug }: SpeciesDetailViewProps) {
  const speciesQuery = useSpeciesDetail(slug);
  const traitsQuery = useSpeciesTraits(slug, !!slug);
  const choicesQuery = useSpeciesTraitChoices(slug, !!slug);
  const backHref = useCatalogBackHref("/species");

  const choicesByTrait = useMemo(
    () => groupChoicesByTrait(choicesQuery.data?.data ?? []),
    [choicesQuery.data?.data],
  );

  const choiceTraitNames = useMemo(
    () => new Set(choicesByTrait.map(([name]) => name)),
    [choicesByTrait],
  );

  if (speciesQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (speciesQuery.isError || !speciesQuery.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          speciesQuery.error instanceof Error
            ? speciesQuery.error.message
            : "Espécie não encontrada"
        }
      />
    );
  }

  const species = speciesQuery.data;
  const traits: SpeciesTrait[] = traitsQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-12">
      <SpeciesHero species={species} backHref={backHref} />

      {species.description ? (
        <section aria-labelledby="species-about" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Lore
            </p>
            <h2
              id="species-about"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Sobre a espécie
            </h2>
          </div>
          <div className="relative border-l-2 border-primary/50 pl-5 sm:pl-6">
            <PhbProse
              text={species.description}
              className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
            />
          </div>
          {species.size.includes("(") ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/80">Tamanho: </span>
              {species.size}
            </p>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="species-traits" className="space-y-6">
        <div className="space-y-1">
          <h2
            id="species-traits"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Traços
          </h2>
          <p className="text-sm text-muted-foreground">
            Abra cada card para ler o texto do PHB.
          </p>
        </div>

        {traitsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando traços…</p>
        ) : traitsQuery.isError || !traits.length ? (
          <p className="text-sm text-muted-foreground">
            Sem traços cadastrados.
          </p>
        ) : (
          <div className="space-y-3">
            {traits.map((trait) => {
              const traitChoices = choiceTraitNames.has(trait.name)
                ? (choicesByTrait.find(([name]) => name === trait.name)?.[1] ??
                  [])
                : [];

              return (
                <CollapsibleCard
                  key={trait.name}
                  title={trait.name}
                  subtitle={
                    trait.choiceKind ? "Inclui opções à escolha" : undefined
                  }
                >
                  <div className="space-y-4">
                    <PhbProse text={trait.description} />
                    {traitChoices.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Opções
                        </p>
                        <TraitChoiceBlock choices={traitChoices} />
                      </div>
                    ) : null}
                  </div>
                </CollapsibleCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
