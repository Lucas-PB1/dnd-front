"use client";

import { Suspense } from "react";

import { useFeatDetail } from "@/features/feat-catalog/api/use-feats";
import type { FeatSummary } from "@/entities/feat/types";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type FeatDetailViewProps = {
  slug: string;
};

function FeatHero({ feat, backHref }: { feat: FeatSummary; backHref: string }) {
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
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Talentos"
      title={feat.name}
      eyebrow={feat.categoryTypeLabel || feat.categoryName}
      stats={stats}
      statsClassName={
        stats.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : undefined
      }
    />
  );
}

function FeatDetailBody({ slug }: FeatDetailViewProps) {
  const { data, isPending, isError, error } = useFeatDetail(slug);
  const backHref = useCatalogBackHref("/feats");

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando talento…</p>;
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Talento não encontrado"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <FeatHero feat={data} backHref={backHref} />

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

export function FeatDetailView({ slug }: FeatDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando talento…</p>
      }
    >
      <FeatDetailBody slug={slug} />
    </Suspense>
  );
}
