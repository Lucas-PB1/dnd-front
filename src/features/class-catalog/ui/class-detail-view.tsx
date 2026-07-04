"use client";

import Link from "next/link";

import {
  useClassDetail,
  useClassFeatures,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type ClassDetailViewProps = {
  slug: string;
};

export function ClassDetailView({ slug }: ClassDetailViewProps) {
  const classQuery = useClassDetail(slug);
  const subclassesQuery = useClassSubclasses(slug);
  const featuresQuery = useClassFeatures(slug, undefined, !!slug);

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
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Link
          href="/classes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Compêndio
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{cls.name}</h1>
        {cls.primaryAbilityLabel ? (
          <p className="text-muted-foreground">
            Atributo principal: {cls.primaryAbilityLabel}
          </p>
        ) : null}
      </div>

      <dl className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Dado de vida
          </dt>
          <dd className="font-mono text-lg">{cls.hitDie}</dd>
        </div>
        {cls.hpLevel1DieValue != null ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              PV nível 1
            </dt>
            <dd className="text-lg">{cls.hpLevel1DieValue} + CON</dd>
          </div>
        ) : null}
        {cls.hpFixedPerLevel != null ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              PV por nível
            </dt>
            <dd className="text-lg">+{cls.hpFixedPerLevel} + CON</dd>
          </div>
        ) : null}
        {cls.skillChoiceCount != null ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Perícias
            </dt>
            <dd className="text-lg">
              {cls.skillChoiceCount} à escolha
              {cls.skillChoiceFrom === "any" ? " (qualquer)" : ""}
            </dd>
          </div>
        ) : null}
      </dl>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Características</h2>
        {featuresQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : featuresQuery.isError || !featuresQuery.data?.data.length ? (
          <p className="text-sm text-muted-foreground">
            Sem características cadastradas.
          </p>
        ) : (
          <ul className="space-y-3">
            {featuresQuery.data.data.map((feature) => (
              <li
                key={`${feature.featureLevel}-${feature.featureName}`}
                className="rounded-lg border border-border px-4 py-3"
              >
                <p className="text-sm font-medium">
                  Nv. {feature.featureLevel} — {feature.featureName}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {feature.featureDescription}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Subclasses</h2>
        {subclassesQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Carregando subclasses…
          </p>
        ) : subclassesQuery.isError ? (
          <p className="text-sm text-muted-foreground">
            Sem subclasses disponíveis.
          </p>
        ) : !subclassesQuery.data?.data.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma subclasse cadastrada.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {subclassesQuery.data.data.map((sub) => (
              <li key={sub.slug} className="px-4 py-3">
                <p className="font-medium">{sub.name}</p>
                {sub.tagline ? (
                  <p className="text-sm text-muted-foreground">{sub.tagline}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
