"use client";

import { Suspense } from "react";

import type { SkillSummary } from "@/entities/skill/types";
import { useSkillDetail } from "@/features/skill-catalog/api/use-skills";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
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
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Perícias"
      title={skill.name}
      eyebrow={skill.abilityName}
      stats={[{ label: "Atributo", value: skill.abilityName }]}
    />
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
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Perícia não encontrada"
        }
      />
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
