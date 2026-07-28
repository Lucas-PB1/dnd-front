"use client";

import { useMemo } from "react";

import type { ClassFeature } from "@/entities/class/types";
import { useClassFeatures } from "@/features/class-catalog/api/use-classes";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sections/sheet-section-types";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

export function ClassFeaturesSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const featuresQuery = useClassFeatures(
    character.classSlug,
    character.level,
    !!character.classSlug,
  );

  const byLevel = useMemo(() => {
    const map = new Map<number, ClassFeature[]>();
    for (const feature of featuresQuery.data?.data ?? []) {
      const list = map.get(feature.featureLevel) ?? [];
      list.push(feature);
      map.set(feature.featureLevel, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [featuresQuery.data?.data]);

  if (featuresQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando características…
      </p>
    );
  }

  if (featuresQuery.isError || byLevel.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma característica de classe disponível.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque em uma característica para ler o texto.
      </p>
      {byLevel.map(([level, features]) => (
        <section key={level} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
              Nv. {level}
            </span>
            <span className="h-px flex-1 bg-border/50" aria-hidden />
          </div>
          <div className="space-y-1.5">
            {features.map((feature) => (
              <CollapsibleCard
                key={`${level}-${feature.featureName}`}
                title={feature.featureName}
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                <PhbProse text={feature.featureDescription} />
              </CollapsibleCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
