"use client";

import { useState } from "react";

import type { StrikeOption } from "@/entities/combat-mechanical/types";
import { strikeOptionSummary } from "@/features/character/character-sheet/lib/combat/available-strike-options";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "@/features/character/character-sheet/ui/beyond/combat/shared/panel-action-row";

type StrikeOptionsPanelProps = {
  options: readonly StrikeOption[];
  knownSlugs: readonly string[];
  level: number;
  isPending: boolean;
  remaining?: number | null;
  canTakeLowerCost?: boolean;
  onUse: (option: StrikeOption, takeLowerCost: boolean) => void;
};

export function StrikeOptionsPanel({
  options,
  knownSlugs,
  level,
  isPending,
  remaining,
  canTakeLowerCost = false,
  onUse,
}: StrikeOptionsPanelProps) {
  const [takeLowerCost, setTakeLowerCost] = useState(false);
  const known = new Set(knownSlugs);

  if (options.length === 0) return null;

  return (
    <div className="space-y-1">
      {canTakeLowerCost ? (
        <label className="text-[0.65rem] text-muted-foreground">
          <input
            className="mr-1 align-middle"
            type="checkbox"
            checked={takeLowerCost}
            onChange={(event) => setTakeLowerCost(event.target.checked)}
          />
          Menor de dois dados de custo
        </label>
      ) : null}
      <CombatPanelActionList
        title={remaining != null ? `Golpes (${remaining})` : "Golpes"}
        count={options.length}
      >
        {options.map((option) => {
          const knows = known.has(option.slug);
          const canSpend = knows && Boolean(option.tableAction);
          return (
            <CombatPanelActionRow
              key={option.slug}
              name={option.name}
              description={strikeOptionSummary(option, level)}
              disabled={!canSpend}
              pending={isPending}
              onAction={() => onUse(option, takeLowerCost)}
            />
          );
        })}
      </CombatPanelActionList>
    </div>
  );
}
