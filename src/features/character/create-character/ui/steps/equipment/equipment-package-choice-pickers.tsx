"use client";

import {
  choicePickKey,
  toolOptionsForPool,
} from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";
import type { EquipmentLine } from "@/features/character/create-character/lib/equipment/equipment-selection";
import { nativeSelectClassName } from "@/shared/ui/native-select";

type ChoicePickersProps = {
  source: "class" | "background";
  packageSlug: string;
  lines: EquipmentLine[];
  choicePicks: Record<string, string>;
  backgroundToolItemSlug?: string;
  onPick: (
    source: "class" | "background",
    packageSlug: string,
    sortOrder: number,
    valueId: string,
  ) => void;
};

export function ChoicePickers({
  source,
  packageSlug,
  lines,
  choicePicks,
  backgroundToolItemSlug,
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
                  {toolOptionsForPool(pool).find(
                    (o) => o.slug === backgroundToolItemSlug,
                  )?.name ?? backgroundToolItemSlug}
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-destructive">
                    Ainda não há ferramenta no Antecedente — escolha abaixo ou
                    volte um passo.
                  </p>
                  <select
                    className={nativeSelectClassName}
                    value={choicePicks[key] ?? ""}
                    onChange={(e) =>
                      onPick(source, packageSlug, sortOrder, e.target.value)
                    }
                  >
                    <option value="">Selecionar…</option>
                    {toolOptionsForPool(pool).map((opt) => (
                      <option key={opt.slug} value={opt.slug}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
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
            <select
              id={key}
              className={nativeSelectClassName}
              value={choicePicks[key] ?? ""}
              onChange={(e) =>
                onPick(source, packageSlug, sortOrder, e.target.value)
              }
            >
              <option value="">Selecionar…</option>
              {toolOptionsForPool(pool).map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
