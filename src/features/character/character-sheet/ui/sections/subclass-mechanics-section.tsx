"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { subclassFeatureKindLabel } from "@/entities/subclass/lib/feature-kind-label";
import type { SubclassMechanic } from "@/entities/subclass/types";
import { useSubclassMechanics } from "@/features/catalog/class-catalog/api/use-classes";
import {
  LevelGroupedDetailTiles,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import { PhbProse } from "@/shared/ui/phb-prose";

function formatSubclassMechanicMeta(
  mechanic: SubclassMechanic,
): string | null {
  const parts: string[] = [];
  const kind = subclassFeatureKindLabel(mechanic.featureKind);
  if (kind) parts.push(kind);
  if (mechanic.resourceName) {
    let resource = mechanic.resourceName;
    if (mechanic.resourceUnlockLevel != null) {
      resource += ` (nv. ${mechanic.resourceUnlockLevel})`;
    }
    parts.push(resource);
  }
  if (mechanic.fixedMax != null) {
    parts.push(`máx. ${mechanic.fixedMax}`);
  } else if (mechanic.maxFormula) {
    parts.push(`máx. ${mechanic.maxFormula}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function subclassMechanicListKey(
  level: number,
  mechanic: SubclassMechanic,
  index: number,
): string {
  return [
    level,
    mechanic.featureName,
    mechanic.optionKey ?? "",
    mechanic.resourceSlug ?? "",
    mechanic.resourceUnlockLevel ?? "",
    mechanic.maxFormula ?? "",
    mechanic.fixedMax ?? "",
    index,
  ].join("|");
}

export function SubclassMechanicsSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const enabled =
    isSubclassRequired(character.level) && !!character.subclassSlug;
  const mechanicsQuery = useSubclassMechanics(
    character.subclassSlug ?? "",
    enabled,
  );

  const selectedOptionKeys = useMemo(
    () => new Set(character.subclassOptions.map((o) => o.optionKey)),
    [character.subclassOptions],
  );

  const groups = useMemo(() => {
    const map = new Map<number, SubclassMechanic[]>();
    for (const mechanic of mechanicsQuery.data?.data ?? []) {
      if (mechanic.featureLevel > character.level) continue;
      const list = map.get(mechanic.featureLevel) ?? [];
      list.push(mechanic);
      map.set(mechanic.featureLevel, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([level, mechanics]) => ({
        level,
        items: mechanics.map((mechanic, index): DetailTileItem => {
          const meta = formatSubclassMechanicMeta(mechanic);
          const matchesOption =
            mechanic.optionKey != null &&
            selectedOptionKeys.has(mechanic.optionKey);
          const description = mechanic.featureDescription?.trim();
          return {
            id: subclassMechanicListKey(level, mechanic, index),
            title: mechanic.featureName,
            subtitle: matchesOption
              ? "Opção escolhida"
              : (meta ?? undefined),
            badge: `Nv. ${level}`,
            accent: matchesOption,
            body: description ? (
              <div className="space-y-3">
                {meta && matchesOption ? (
                  <p className="text-xs text-muted-foreground">{meta}</p>
                ) : null}
                <PhbProse text={description} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {meta ?? "Sem descrição cadastrada."}
              </p>
            ),
          };
        }),
      }));
  }, [
    character.level,
    mechanicsQuery.data?.data,
    selectedOptionKeys,
  ]);

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Subclasse disponível a partir do nível 3.
      </p>
    );
  }

  if (mechanicsQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando mecânicas de subclasse…
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma mecânica de subclasse até o nível atual.
      </p>
    );
  }

  return (
    <LevelGroupedDetailTiles
      groups={groups}
      hint="Toque em uma mecânica para ler o texto."
    />
  );
}
