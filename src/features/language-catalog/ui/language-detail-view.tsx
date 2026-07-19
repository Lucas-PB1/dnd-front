"use client";

import Link from "next/link";
import { Suspense } from "react";

import type { LanguageSummary } from "@/entities/language/types";
import { useLanguageDetail } from "@/features/language-catalog/api/use-languages";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";

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
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href={backHref}>Idiomas</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {language.name}
          </h1>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {language.isRare ? "Idioma raro" : "Idioma comum"}
          </p>
        </div>

        <dl
          className={cn(
            "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
            stats.length >= 3
              ? "grid-cols-1 sm:grid-cols-3"
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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Idioma não encontrado"}
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
