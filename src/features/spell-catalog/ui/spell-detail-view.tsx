"use client";

import Link from "next/link";

import type { SpellSummary } from "@/entities/spell/types";
import { useSpellDetail } from "@/features/spell-catalog/api/use-spells";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

type SpellDetailViewProps = {
  slug: string;
};

function SpellHero({ spell }: { spell: SpellSummary }) {
  const stats: { label: string; value: string }[] = [
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
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href="/spells">Magias</BackLink>

        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {spell.name}
            </h1>
            <span className="font-mono text-sm tracking-wide text-secondary">
              {spell.levelLabel}
            </span>
          </div>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {spell.schoolName}
          </p>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md bg-secondary/25 px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
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

        {spell.materialDescription ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">Material: </span>
            {spell.materialDescription}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function SpellDetailView({ slug }: SpellDetailViewProps) {
  const { data, isPending, isError, error } = useSpellDetail(slug);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando magia…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Magia não encontrada"}
        </p>
        <Link
          href="/spells"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao compêndio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <SpellHero spell={data} />

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
