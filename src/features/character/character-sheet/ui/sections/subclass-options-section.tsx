"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { resolveSubclassOptionValueLabel } from "@/features/character/create-character/lib/subclass/resolve-subclass-option-select";
import { useSubclassOptions } from "@/features/catalog/class-catalog/api/use-classes";
import { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
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
  const labels = useCharacterCatalogLabels(character);

  const items = useMemo((): DetailTileItem[] => {
    const groups = optionsQuery.data?.data ?? [];
    return character.subclassOptions.map((opt) => {
      const group = groups.find((entry) => entry.optionKey === opt.optionKey);
      const valueLabel = resolveSubclassOptionValueLabel(
        group,
        opt.valueId,
        labels.resolveSkill,
        labels.resolveSpell,
      );
      const label = group?.label ?? opt.optionKey;
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
  }, [
    character.subclassOptions,
    labels.resolveSkill,
    labels.resolveSpell,
    optionsQuery.data?.data,
  ]);

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
