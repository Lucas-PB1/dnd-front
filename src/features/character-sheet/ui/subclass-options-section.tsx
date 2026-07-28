"use client";

import { useMemo } from "react";

import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { useSubclassOptions } from "@/features/class-catalog/api/use-classes";
import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sheet-section-types";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";

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

  const resolved = useMemo(() => {
    const groups = optionsQuery.data?.data ?? [];
    return character.subclassOptions.map((opt) => {
      const group = groups.find((g) => g.optionKey === opt.optionKey);
      const value = group?.values.find((v) => v.valueId === opt.valueId);
      return {
        ...opt,
        label: group?.label ?? opt.optionKey,
        valueLabel: value?.label ?? opt.valueId,
        unlockLevel: group?.unlockLevel,
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
    <div className="space-y-1.5">
      {resolved.map((item) => (
        <CollapsibleCard
          key={item.optionKey}
          title={item.valueLabel}
          subtitle={
            item.unlockLevel != null
              ? `${item.label} · nv. ${item.unlockLevel}`
              : item.label
          }
          size="compact"
          defaultOpen={false}
          className="bg-background/50"
        >
          <p className="text-sm text-muted-foreground">
            Opção de subclasse selecionada.
          </p>
        </CollapsibleCard>
      ))}
    </div>
  );
}
