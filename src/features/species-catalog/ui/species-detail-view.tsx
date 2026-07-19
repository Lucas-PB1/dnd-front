"use client";

import Link from "next/link";
import { useMemo } from "react";

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
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type SpeciesDetailViewProps = {
  slug: string;
};

function SpeciesHero({ species }: { species: SpeciesSummary }) {
  const stats = [
    { label: "Tipo", value: species.creatureType },
    { label: "Tamanho", value: shortSpeciesSize(species.size) },
    { label: "Deslocamento", value: species.speed },
  ];

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href="/species">Espécies</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {species.name}
          </h1>
          {species.tagline ? (
            <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
              {species.tagline}
            </p>
          ) : null}
          {species.summary ? (
            <p className="max-w-2xl font-heading text-lg leading-snug text-foreground/90 sm:text-xl">
              {species.summary}
            </p>
          ) : null}
        </div>

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4"
            >
              <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 font-heading text-base font-semibold leading-tight sm:text-lg">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
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
  const speciesQuery = useSpeciesDetail(slug);
  const traitsQuery = useSpeciesTraits(slug, !!slug);
  const choicesQuery = useSpeciesTraitChoices(slug, !!slug);

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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {speciesQuery.error instanceof Error
            ? speciesQuery.error.message
            : "Espécie não encontrada"}
        </p>
        <Link
          href="/species"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao compêndio
        </Link>
      </div>
    );
  }

  const species = speciesQuery.data;
  const traits: SpeciesTrait[] = traitsQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-12">
      <SpeciesHero species={species} />

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
