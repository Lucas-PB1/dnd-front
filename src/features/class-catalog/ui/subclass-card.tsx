"use client";

import type { SubclassSummary } from "@/entities/class/types";
import { useSubclassMechanics } from "@/features/class-catalog/api/use-classes";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type SubclassCardProps = {
  subclass: SubclassSummary;
};

function kindLabel(kind: string | null): string | null {
  if (!kind) return null;
  const map: Record<string, string> = {
    passive: "Passivo",
    resource: "Recurso",
    choice: "Escolha",
    spell: "Magia",
  };
  return map[kind] ?? kind;
}

export function SubclassCard({ subclass }: SubclassCardProps) {
  const mechanicsQuery = useSubclassMechanics(subclass.slug, true);
  const teaser = subclass.tagline ?? subclass.summary ?? "Subclasse PHB";

  return (
    <CollapsibleCard title={subclass.name} subtitle={teaser}>
      <div className="space-y-5">
        {subclass.summary && subclass.tagline ? (
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {subclass.summary}
          </p>
        ) : null}

        {mechanicsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Carregando características…
          </p>
        ) : mechanicsQuery.isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar as características.
          </p>
        ) : !mechanicsQuery.data?.data.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma característica cadastrada.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Características
            </p>
            {mechanicsQuery.data.data.map((feature) => {
              const kind = kindLabel(feature.featureKind);
              const resource = feature.resourceName
                ? `Recurso: ${feature.resourceName}`
                : null;
              const meta = [`Nv. ${feature.featureLevel}`, kind, resource]
                .filter(Boolean)
                .join(" · ");

              return (
                <CollapsibleCard
                  key={`${feature.featureLevel}-${feature.featureName}`}
                  title={feature.featureName}
                  subtitle={meta}
                >
                  <PhbProse text={feature.featureDescription} />
                </CollapsibleCard>
              );
            })}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
