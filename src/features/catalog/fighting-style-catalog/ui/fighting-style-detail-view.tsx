"use client";

import { Suspense } from "react";

import type { FightingStyleSummary } from "@/entities/fighting-style/types";
import { useFightingStyleDetail } from "@/features/catalog/fighting-style-catalog/api/use-fighting-styles";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { PhbProse } from "@/shared/ui/phb-prose";

type FightingStyleDetailViewProps = {
  slug: string;
};

function FightingStyleHero({
  style,
  backHref,
}: {
  style: FightingStyleSummary;
  backHref: string;
}) {
  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Estilos de luta"
      title={style.name}
      eyebrow="Estilo de luta"
    />
  );
}

function FightingStyleDetailBody({ slug }: FightingStyleDetailViewProps) {
  const { data, isPending, isError, error } = useFightingStyleDetail(slug);
  const backHref = useCatalogBackHref("/fighting-styles");

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando estilo…</p>
    );
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Estilo não encontrado"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <FightingStyleHero style={data} backHref={backHref} />

      <section aria-labelledby="fighting-style-description" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Benefício
          </p>
          <h2
            id="fighting-style-description"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            O que o estilo concede
          </h2>
        </div>

        {data.description ? (
          <PhbProse
            text={data.description}
            className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Sem descrição.</p>
        )}
      </section>
    </div>
  );
}

export function FightingStyleDetailView({ slug }: FightingStyleDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando estilo…</p>
      }
    >
      <FightingStyleDetailBody slug={slug} />
    </Suspense>
  );
}
