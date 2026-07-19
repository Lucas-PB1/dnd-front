"use client";

import Link from "next/link";

import { useFeatDetail } from "@/features/feat-catalog/api/use-feats";
import type { FeatSummary } from "@/entities/feat/types";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type FeatDetailViewProps = {
  slug: string;
};

function FeatHero({ feat }: { feat: FeatSummary }) {
  const stats: { label: string; value: string }[] = [
    {
      label: "Categoria",
      value: feat.categoryTypeLabel || feat.categoryName,
    },
  ];
  if (feat.repeatable) {
    stats.push({ label: "Repetível", value: "Sim" });
  }
  if (feat.prerequisite) {
    stats.push({ label: "Pré-requisito", value: feat.prerequisite });
  }
  if (feat.benefits.length) {
    stats.push({
      label: "Benefícios",
      value: String(feat.benefits.length),
    });
  }

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href="/feats">Talentos</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {feat.name}
          </h1>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {feat.categoryTypeLabel || feat.categoryName}
          </p>
        </div>

        <dl
          className={cn(
            "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
            stats.length >= 3
              ? "grid-cols-2 sm:grid-cols-4"
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

export function FeatDetailView({ slug }: FeatDetailViewProps) {
  const { data, isPending, isError, error } = useFeatDetail(slug);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando talento…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Talento não encontrado"}
        </p>
        <Link
          href="/feats"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao compêndio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <FeatHero feat={data} />

      <section aria-labelledby="feat-benefits" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Benefícios
          </p>
          <h2
            id="feat-benefits"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            O que este talento concede
          </h2>
        </div>

        {!data.benefits.length ? (
          <p className="text-sm text-muted-foreground">
            Sem benefícios cadastrados.
          </p>
        ) : (
          <div className="space-y-3">
            {data.benefits.map((benefit, index) => (
              <CollapsibleCard
                key={`${benefit.name ?? "benefit"}-${index}`}
                title={benefit.name ?? `Benefício ${index + 1}`}
                defaultOpen={data.benefits.length <= 3}
              >
                {benefit.description ? (
                  <PhbProse
                    text={benefit.description}
                    className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem descrição.
                  </p>
                )}
              </CollapsibleCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
