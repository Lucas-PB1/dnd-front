"use client";

import Link from "next/link";
import { Suspense } from "react";

import type { SkillSummary } from "@/entities/skill/types";
import { useSkillDetail } from "@/features/skill-catalog/api/use-skills";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

type SkillDetailViewProps = {
  slug: string;
};

function SkillHero({
  skill,
  backHref,
}: {
  skill: SkillSummary;
  backHref: string;
}) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href={backHref}>Perícias</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {skill.name}
          </h1>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {skill.abilityName}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          <div className="bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4">
            <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              Atributo
            </dt>
            <dd className="mt-1 font-heading text-base font-semibold leading-tight sm:text-lg">
              {skill.abilityName}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function SkillDetailBody({ slug }: SkillDetailViewProps) {
  const { data, isPending, isError, error } = useSkillDetail(slug);
  const backHref = useCatalogBackHref("/skills");

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando perícia…</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Perícia não encontrada"}
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
      <SkillHero skill={data} backHref={backHref} />

      <section aria-labelledby="skill-description" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Descrição
          </p>
          <h2
            id="skill-description"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Como usar esta perícia
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

export function SkillDetailView({ slug }: SkillDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando perícia…</p>
      }
    >
      <SkillDetailBody slug={slug} />
    </Suspense>
  );
}
