"use client";

import { Suspense } from "react";

import type { LanguageSummary } from "@/entities/language/types";
import { useLanguageDetail } from "@/features/language-catalog/api/use-languages";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";

type LanguageDetailViewProps = {
  slug: string;
};

function LanguageHero({
  language,
  backHref,
}: {
  language: LanguageSummary;
  backHref: string;
}) {
  const stats: { label: string; value: string }[] = [
    {
      label: "Raridade",
      value: language.isRare ? "Raro" : "Comum",
    },
  ];
  if (language.script) {
    stats.push({ label: "Escrita", value: language.script });
  }
  if (language.typicalSpeakers) {
    stats.push({ label: "Falantes", value: language.typicalSpeakers });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Idiomas"
      title={language.name}
      eyebrow={language.isRare ? "Idioma raro" : "Idioma comum"}
      stats={stats}
    />
  );
}

function LanguageDetailBody({ slug }: LanguageDetailViewProps) {
  const { data, isPending, isError, error } = useLanguageDetail(slug);
  const backHref = useCatalogBackHref("/languages");

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando idioma…</p>
    );
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Idioma não encontrado"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <LanguageHero language={data} backHref={backHref} />
    </div>
  );
}

export function LanguageDetailView({ slug }: LanguageDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando idioma…</p>
      }
    >
      <LanguageDetailBody slug={slug} />
    </Suspense>
  );
}
