"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { useSubclassOptions } from "@/features/catalog/class-catalog/api/use-classes";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";

export function SubclassOptionsSection({
  character,
}: Pick<SheetReadSectionProps, "character">) {
  const enabled =
    isSubclassRequired(character.level) && !!character.subclassSlug;
  const optionsQuery = useSubclassOptions(
    character.subclassSlug ?? "",
    character.level,
    enabled && character.subclassOptions.length > 0,
  );

  const items = useMemo((): DetailTileItem[] => {
    const groups = optionsQuery.data?.data ?? [];
    return character.subclassOptions.map((opt) => {
      const group = groups.find((g) => g.optionKey === opt.optionKey);
      const value = group?.values.find((v) => v.valueId === opt.valueId);
      const label = group?.label ?? opt.optionKey;
      const valueLabel = value?.label ?? opt.valueId;
      return {
        id: opt.optionKey,
        title: valueLabel,
        subtitle:
          group?.unlockLevel != null
            ? `${label} · nv. ${group.unlockLevel}`
            : label,
        accent: true,
        body: (
          <p className="text-sm text-muted-foreground">
            Opção de subclasse selecionada:{" "}
            <span className="font-medium text-foreground">{valueLabel}</span>
            {" — "}
            {label}.
          </p>
        ),
      };
    });
  }, [character.subclassOptions, optionsQuery.data?.data]);

  if (!enabled || character.subclassOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma opção de subclasse registrada.
      </p>
    );
  }

  if (optionsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando opções…</p>;
  }

  return (
    <DetailTileGrid
      items={items}
      hint="Toque para ver a opção escolhida."
    />
  );
}
