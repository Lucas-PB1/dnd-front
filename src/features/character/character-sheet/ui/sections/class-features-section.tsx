"use client";

import { useMemo } from "react";

import type { ClassFeature } from "@/entities/class/types";
import { useClassFeatures } from "@/features/catalog/class-catalog/api/use-classes";
import {
  LevelGroupedDetailTiles,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import { PhbProse } from "@/shared/ui/phb-prose";

export function ClassFeaturesSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const featuresQuery = useClassFeatures(
    character.classSlug,
    character.level,
    !!character.classSlug,
  );

  const groups = useMemo(() => {
    const map = new Map<number, ClassFeature[]>();
    for (const feature of featuresQuery.data?.data ?? []) {
      const list = map.get(feature.featureLevel) ?? [];
      list.push(feature);
      map.set(feature.featureLevel, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([level, features]) => ({
        level,
        items: features.map(
          (feature): DetailTileItem => ({
            id: `${level}-${feature.featureName}`,
            title: feature.featureName,
            badge: `Nv. ${level}`,
            body: <PhbProse text={feature.featureDescription} />,
          }),
        ),
      }));
  }, [featuresQuery.data?.data]);

  if (featuresQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando características…
      </p>
    );
  }

  if (featuresQuery.isError || groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma característica de classe disponível.
      </p>
    );
  }

  return (
    <LevelGroupedDetailTiles
      groups={groups}
      hint="Toque em um traço para ler o texto."
    />
  );
}
