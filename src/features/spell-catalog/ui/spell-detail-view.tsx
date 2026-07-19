"use client";

import { Suspense } from "react";

import type { SpellSummary } from "@/entities/spell/types";
import { useSpellDetail } from "@/features/spell-catalog/api/use-spells";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { PhbProse } from "@/shared/ui/phb-prose";

type SpellDetailViewProps = {
  slug: string;
};

function SpellHero({
  spell,
  backHref,
}: {
  spell: SpellSummary;
  backHref: string;
}) {
  const stats = [
    { label: "Tempo", value: spell.castingTime },
    { label: "Alcance", value: spell.range },
    { label: "Componentes", value: spell.componentsLabel ?? "—" },
    { label: "Duração", value: spell.duration },
  ];

  const badges = [
    spell.concentration ? "Concentração" : null,
    spell.ritual ? "Ritual" : null,
  ].filter(Boolean) as string[];

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Magias"
      title={spell.name}
      titleExtra={
        <span className="font-mono text-sm tracking-wide text-secondary">
          {spell.levelLabel}
        </span>
      }
      eyebrow={spell.schoolName}
      badges={badges}
      stats={stats}
    >
      {spell.materialDescription ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">Material: </span>
          {spell.materialDescription}
        </p>
      ) : null}
    </CatalogDetailHero>
  );
}

function SpellDetailBody({ slug }: SpellDetailViewProps) {
  const { data, isPending, isError, error } = useSpellDetail(slug);
  const backHref = useCatalogBackHref("/spells");

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando magia…</p>;
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Magia não encontrada"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <SpellHero spell={data} backHref={backHref} />

      <section aria-labelledby="spell-effect" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Efeito
          </p>
          <h2
            id="spell-effect"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Descrição
          </h2>
        </div>
        <div className="relative border-l-2 border-primary/50 pl-5 sm:pl-6">
          <PhbProse
            text={data.description}
            className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
          />
        </div>
      </section>

      {data.higherLevels ? (
        <section aria-labelledby="spell-higher" className="space-y-4">
          <h2
            id="spell-higher"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Em níveis superiores
          </h2>
          <div className="relative border-l-2 border-secondary/50 pl-5 sm:pl-6">
            <PhbProse
              text={data.higherLevels}
              className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function SpellDetailView({ slug }: SpellDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando magia…</p>
      }
    >
      <SpellDetailBody slug={slug} />
    </Suspense>
  );
}
