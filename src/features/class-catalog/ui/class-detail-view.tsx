"use client";

import Link from "next/link";
import { useMemo } from "react";

import type { ClassFeature } from "@/entities/class/types";
import {
  useClassDetail,
  useClassFeatures,
  useClassSkills,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import { SubclassCard } from "@/features/class-catalog/ui/subclass-card";
import { cn } from "@/shared/lib/utils";
import { CatalogPageHeader } from "@/shared/ui/catalog-page-header";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";
import { buttonVariants } from "@/shared/ui/button";

type ClassDetailViewProps = {
  slug: string;
};

function groupFeaturesByLevel(features: ClassFeature[]) {
  const map = new Map<number, ClassFeature[]>();
  for (const feature of features) {
    const list = map.get(feature.featureLevel) ?? [];
    list.push(feature);
    map.set(feature.featureLevel, list);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

export function ClassDetailView({ slug }: ClassDetailViewProps) {
  const classQuery = useClassDetail(slug);
  const subclassesQuery = useClassSubclasses(slug);
  const featuresQuery = useClassFeatures(slug, undefined, !!slug);
  const skillsQuery = useClassSkills(slug, !!slug);

  const featuresByLevel = useMemo(
    () => groupFeaturesByLevel(featuresQuery.data?.data ?? []),
    [featuresQuery.data?.data],
  );

  if (classQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando classe…</p>;
  }

  if (classQuery.isError || !classQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {classQuery.error instanceof Error
            ? classQuery.error.message
            : "Classe não encontrada"}
        </p>
        <Link
          href="/classes"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao compêndio
        </Link>
      </div>
    );
  }

  const cls = classQuery.data;

  return (
    <div className="flex flex-col gap-10">
      <CatalogPageHeader
        title={cls.name}
        backHref="/classes"
        backLabel="Classes"
        description={
          cls.primaryAbilityLabel
            ? `Atributo principal: ${cls.primaryAbilityLabel}`
            : undefined
        }
      />

      <section aria-labelledby="class-overview" className="space-y-4">
        <h2
          id="class-overview"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Visão geral
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 border-l-2 border-primary/40 pl-4">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Dado de vida
            </dt>
            <dd className="font-heading text-2xl font-semibold">
              {cls.hitDie}
            </dd>
          </div>
          {cls.hpLevel1DieValue != null ? (
            <div className="space-y-1 border-l-2 border-border pl-4">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                PV nível 1
              </dt>
              <dd className="text-lg font-medium">
                {cls.hpLevel1DieValue} + CON
              </dd>
            </div>
          ) : null}
          {cls.hpFixedPerLevel != null ? (
            <div className="space-y-1 border-l-2 border-border pl-4">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                PV por nível
              </dt>
              <dd className="text-lg font-medium">
                +{cls.hpFixedPerLevel} + CON
              </dd>
            </div>
          ) : null}
          {cls.skillChoiceCount != null ? (
            <div className="space-y-1 border-l-2 border-border pl-4">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Perícias
              </dt>
              <dd className="text-lg font-medium">
                {cls.skillChoiceCount} à escolha
                {cls.skillChoiceFrom === "any" ? " (qualquer)" : ""}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-labelledby="class-skills" className="space-y-4">
        <CollapsibleCard
          title="Perícias disponíveis"
          subtitle={
            skillsQuery.data?.data.length
              ? `${skillsQuery.data.data.length} opções`
              : undefined
          }
          defaultOpen={false}
        >
          {skillsQuery.isPending ? (
            <p className="text-sm text-muted-foreground">
              Carregando perícias…
            </p>
          ) : skillsQuery.isError || !skillsQuery.data?.data.length ? (
            <p className="text-sm text-muted-foreground">
              Sem lista de perícias cadastrada.
            </p>
          ) : (
            <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
              {skillsQuery.data.data.map((skill) => (
                <li
                  key={skill.slug}
                  className="mb-2 list-none break-inside-avoid"
                >
                  <span className="inline-flex items-start gap-2 text-sm">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span>{skill.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleCard>
      </section>

      <section aria-labelledby="class-features" className="space-y-6">
        <div className="space-y-1">
          <h2
            id="class-features"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Características de classe
          </h2>
          <p className="text-sm text-muted-foreground">
            Abra cada card para ler o texto do PHB.
          </p>
        </div>

        {featuresQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : featuresQuery.isError || !featuresByLevel.length ? (
          <p className="text-sm text-muted-foreground">
            Sem características cadastradas.
          </p>
        ) : (
          <div className="space-y-8">
            {featuresByLevel.map(([level, features]) => (
              <div key={level} className="space-y-3">
                <h3 className="font-heading text-lg font-semibold">
                  <span className="inline-flex items-center rounded-md bg-secondary/30 px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
                    Nível {level}
                  </span>
                </h3>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <CollapsibleCard
                      key={`${feature.featureLevel}-${feature.featureName}`}
                      title={feature.featureName}
                      subtitle={`Nv. ${feature.featureLevel}`}
                    >
                      <PhbProse text={feature.featureDescription} />
                    </CollapsibleCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="class-subclasses" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="class-subclasses"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Subclasses
          </h2>
          <p className="text-sm text-muted-foreground">
            Abra a subclasse e depois cada característica para ver a descrição
            completa.
          </p>
        </div>

        {subclassesQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Carregando subclasses…
          </p>
        ) : subclassesQuery.isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar as subclasses.
          </p>
        ) : !subclassesQuery.data?.data.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma subclasse cadastrada.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {subclassesQuery.data.data.map((sub) => (
              <SubclassCard key={sub.slug} subclass={sub} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
