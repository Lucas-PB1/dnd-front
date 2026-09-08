"use client";

import { useMemo } from "react";

import { useFeatDetail } from "@/features/catalog/feat-catalog/api/use-feats";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";

export function TransformationSection({ character }: SheetReadSectionProps) {
  const transformation = character.transformation ?? null;
  const slug = transformation?.slug ?? "";
  const detail = useFeatDetail(slug, !!slug);

  const items = useMemo((): DetailTileItem[] => {
    if (!transformation) return [];

    const title = detail.data?.name ?? transformation.slug;
    const choiceBody =
      transformation.choices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma escolha registrada ainda.
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {transformation.choices.map((choice) => (
            <li key={choice.choiceKind}>
              <span className="font-medium text-foreground">{choice.choiceKind}</span>
              <span className="text-muted-foreground"> → {choice.choiceSlug}</span>
            </li>
          ))}
        </ul>
      );

    return [
      {
        id: "summary",
        title,
        subtitle: `Estágio ${transformation.stage}`,
        body: (
          <div className="space-y-2">
            <SheetChip>Cap. 6 · Transformação</SheetChip>
            {choiceBody}
          </div>
        ),
      },
    ];
  }, [detail.data?.name, transformation]);

  if (!transformation) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma transformação Grim Hollow ativa nesta ficha.
      </p>
    );
  }

  return <DetailTileGrid items={items} />;
}
