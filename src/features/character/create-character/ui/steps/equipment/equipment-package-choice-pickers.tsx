"use client";

import {
  choicePickKey,
  toolOptionsForPool,
  type ToolPoolsCatalog,
} from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";
import type { EquipmentLine } from "@/features/character/create-character/lib/equipment";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type ChoicePickersProps = {
  source: "class" | "background";
  packageSlug: string;
  lines: EquipmentLine[];
  choicePicks: Record<string, string>;
  backgroundToolItemSlug?: string;
  toolCatalog?: ToolPoolsCatalog;
  onPick: (
    source: "class" | "background",
    packageSlug: string,
    sortOrder: number,
    valueId: string,
  ) => void;
};

function toolSelectOptions(
  pool: NonNullable<EquipmentLine["pool"]>,
  catalog?: ToolPoolsCatalog,
) {
  return [
    { value: "", label: "Selecionar…" },
    ...toolOptionsForPool(pool, catalog).map((opt) => ({
      value: opt.slug,
      label: opt.name,
    })),
  ];
}

export function ChoicePickers({
  source,
  packageSlug,
  lines,
  choicePicks,
  backgroundToolItemSlug,
  toolCatalog,
  onPick,
}: ChoicePickersProps) {
  return (
    <div className="space-y-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs font-medium text-foreground">
        Complete as escolhas deste pacote
      </p>
      {lines.map((line) => {
        const sortOrder = line.sortOrder ?? 0;
        const key = choicePickKey(source, packageSlug, sortOrder);
        const pool = line.pool;
        if (!pool) return null;

        if (line.kind === "mirror-tool") {
          return (
            <div key={key} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{line.label}</p>
              {backgroundToolItemSlug?.trim() ? (
                <p className="text-sm font-medium">
                  Usando:{" "}
                  {toolOptionsForPool(pool, toolCatalog).find(
                    (o) => o.slug === backgroundToolItemSlug,
                  )?.name ?? backgroundToolItemSlug}
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-destructive">
                    Ainda não há ferramenta no Antecedente — escolha abaixo ou
                    volte um passo.
                  </p>
                  <SearchableSelect
                    id={key}
                    aria-label={line.label}
                    options={toolSelectOptions(pool, toolCatalog)}
                    value={choicePicks[key] ?? ""}
                    placeholder="Selecionar…"
                    onValueChange={(next) =>
                      onPick(source, packageSlug, sortOrder, next)
                    }
                  />
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor={key}>
              {line.label}
            </label>
            <SearchableSelect
              id={key}
              options={toolSelectOptions(pool, toolCatalog)}
              value={choicePicks[key] ?? ""}
              placeholder="Selecionar…"
              onValueChange={(next) =>
                onPick(source, packageSlug, sortOrder, next)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
