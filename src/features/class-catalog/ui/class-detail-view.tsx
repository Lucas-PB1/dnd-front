"use client";

import { Suspense, useMemo } from "react";

import type { ClassFeature, ClassSummary } from "@/entities/class/types";
import {
  useClassDetail,
  useClassFeatures,
  useClassSkills,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import { SubclassCard } from "@/features/class-catalog/ui/subclass-card";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

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

function ClassHero({
  cls,
  backHref,
}: {
  cls: ClassSummary;
  backHref: string;
}) {
  const stats: { label: string; value: string }[] = [
    { label: "Dado de vida", value: cls.hitDie },
  ];
  if (cls.primaryAbilityLabel) {
    stats.push({ label: "Atributo", value: cls.primaryAbilityLabel });
  }
  if (cls.hpLevel1DieValue != null) {
    stats.push({ label: "PV nível 1", value: `${cls.hpLevel1DieValue} + CON` });
  }
  if (cls.hpFixedPerLevel != null) {
    stats.push({
      label: "PV por nível",
      value: `+${cls.hpFixedPerLevel} + CON`,
    });
  }
  if (cls.skillChoiceCount != null) {
    stats.push({
      label: "Perícias",
      value: `${cls.skillChoiceCount} à escolha${cls.skillChoiceFrom === "any" ? " (qualquer)" : ""}`,
    });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Classes"
      title={cls.name}
      titleExtra={
        <span className="font-mono text-sm tracking-wide text-secondary">
          {cls.hitDie}
        </span>
      }
      eyebrow={cls.tagline}
      summary={cls.summary}
      stats={stats}
      statsClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
    />
  );
}

export function ClassDetailView({ slug }: ClassDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando classe…</p>
      }
    >
      <ClassDetailBody slug={slug} />
    </Suspense>
  );
}

function ClassDetailBody({ slug }: ClassDetailViewProps) {
  const classQuery = useClassDetail(slug);
  const subclassesQuery = useClassSubclasses(slug);
  const featuresQuery = useClassFeatures(slug, undefined, !!slug);
  const skillsQuery = useClassSkills(slug, !!slug);
  const backHref = useCatalogBackHref("/classes");

  const featuresByLevel = useMemo(
    () => groupFeaturesByLevel(featuresQuery.data?.data ?? []),
    [featuresQuery.data?.data],
  );

  if (classQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando classe…</p>;
  }

  if (classQuery.isError || !classQuery.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          classQuery.error instanceof Error
            ? classQuery.error.message
            : "Classe não encontrada"
        }
      />
    );
  }

  const cls = classQuery.data;

  return (
    <div className="flex flex-col gap-12">
      <ClassHero cls={cls} backHref={backHref} />

      {cls.description ? (
        <section aria-labelledby="class-about" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Lore
            </p>
            <h2
              id="class-about"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Sobre a classe
            </h2>
          </div>
          <div className="relative border-l-2 border-primary/50 pl-5 sm:pl-6">
            <PhbProse
              text={cls.description}
              className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
            />
          </div>
        </section>
      ) : null}

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
