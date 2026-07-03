"use client";

import type { Ability } from "@/entities/character-sheet/constants";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
} from "@/entities/character-sheet/constants";
import {
  abilityAssignmentOptions,
  abilityModifier,
  formatAbilityModifierValue,
} from "@/entities/character-sheet/ability-score-generation";
import { ABILITY_GENERATION_UI } from "@/features/character-sheet/ui/ability-generation/ability-generation-labels";
import { cn } from "@/shared/lib/utils";

type AbilityAssignmentGridProps = {
  assigned: Record<Ability, number | null>;
  pool: number[];
  onAssign: (ability: Ability, value: number | null) => void;
};

export function AbilityAssignmentGrid({
  assigned,
  pool,
  onAssign,
}: AbilityAssignmentGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {ABILITY_GENERATION_UI.availablePool}
        </span>
        {pool.length === 0 ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            —
          </span>
        ) : (
          pool.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold"
            >
              {value}
            </span>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => {
          const score = assigned[ability];
          const options = abilityAssignmentOptions(ability, assigned, pool);

          return (
            <div
              key={ability}
              className={cn(
                "flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3",
                score != null && "border-primary/30 bg-primary/5",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ABILITY_ABBREV[ability]}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">{score ?? "—"}</span>
                {score != null ? (
                  <span className="text-sm text-muted-foreground">
                    {formatAbilityModifierValue(abilityModifier(score))}
                  </span>
                ) : null}
              </div>
              <select
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
                value={score ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  onAssign(ability, raw === "" ? null : Number(raw));
                }}
                aria-label={`${ABILITY_GENERATION_UI.assignLabel} ${ABILITY_LABELS[ability]}`}
              >
                <option value="">{ABILITY_GENERATION_UI.unassigned}</option>
                {options.map((value, index) => (
                  <option key={`${value}-${index}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
