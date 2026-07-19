"use client";

import Link from "next/link";
import { Suspense } from "react";

import type { SubclassSummary } from "@/entities/subclass/types";
import { useSubclassMechanics } from "@/features/class-catalog/api/use-classes";
import { useSubclassDetail } from "@/features/subclass-catalog/api/use-subclasses";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type SubclassDetailViewProps = {
  slug: string;
};

function SubclassHero({
  subclass,
  backHref,
}: {
  subclass: SubclassSummary;
  backHref: string;
}) {
  const stats: { label: string; value: string }[] = [
    { label: "Classe", value: subclass.className },
  ];
  if (subclass.sourceChapter != null) {
    stats.push({
      label: "Capítulo",
      value: String(subclass.sourceChapter),
    });
  }
  if (subclass.spellSourceLabel) {
    stats.push({
      label: "Fonte de magias",
      value: subclass.spellSourceLabel,
    });
  }

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href={backHref}>Subclasses</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {subclass.name}
          </h1>
          {subclass.tagline ? (
            <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
              {subclass.tagline}
            </p>
          ) : (
            <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
              {subclass.className}
            </p>
          )}
        </div>

        <dl
          className={cn(
            "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
            stats.length >= 3
              ? "grid-cols-2 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
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

function SubclassDetailBody({ slug }: SubclassDetailViewProps) {
  const { data, isPending, isError, error } = useSubclassDetail(slug);
  const {
    data: mechanics,
    isPending: mechanicsPending,
  } = useSubclassMechanics(slug, !!slug);
  const backHref = useCatalogBackHref("/subclasses");

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando subclasse…</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Subclasse não encontrada"}
        </p>
        <Link
          href={backHref}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao compêndio
        </Link>
      </div>
    );
  }

  const features = mechanics?.data ?? [];

  return (
    <div className="flex flex-col gap-12">
      <SubclassHero subclass={data} backHref={backHref} />

      {data.summary ? (
        <section aria-labelledby="subclass-summary" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Resumo
            </p>
            <h2
              id="subclass-summary"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Visão geral
            </h2>
          </div>
          <PhbProse
            text={data.summary}
            className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
          />
        </section>
      ) : null}

      <section aria-labelledby="subclass-features" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Características
          </p>
          <h2
            id="subclass-features"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Recursos da subclasse
          </h2>
        </div>

        {mechanicsPending && !mechanics ? (
          <p className="text-sm text-muted-foreground">
            Carregando características…
          </p>
        ) : !features.length ? (
          <p className="text-sm text-muted-foreground">
            Sem características cadastradas.
          </p>
        ) : (
          <div className="space-y-3">
            {features.map((feature, index) => {
              const title = `Nível ${feature.featureLevel} · ${feature.featureName}`;
              const meta: string[] = [];
              if (feature.resourceName) {
                meta.push(feature.resourceName);
              }
              if (feature.maxFormula) {
                meta.push(`Máx.: ${feature.maxFormula}`);
              } else if (feature.fixedMax != null) {
                meta.push(`Máx.: ${feature.fixedMax}`);
              }

              return (
                <CollapsibleCard
                  key={`${feature.featureLevel}-${feature.featureName}-${index}`}
                  title={title}
                  defaultOpen={features.length <= 4}
                >
                  {meta.length ? (
                    <p className="mb-3 text-xs text-muted-foreground">
                      {meta.join(" · ")}
                    </p>
                  ) : null}
                  {feature.featureDescription ? (
                    <PhbProse
                      text={feature.featureDescription}
                      className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sem descrição.
                    </p>
                  )}
                </CollapsibleCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function SubclassDetailView({ slug }: SubclassDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando subclasse…</p>
      }
    >
      <SubclassDetailBody slug={slug} />
    </Suspense>
  );
}
