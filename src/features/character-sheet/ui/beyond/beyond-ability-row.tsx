"use client";

import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character";
import { ABILITY_SHORT } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { cn } from "@/shared/lib/utils";

const ORDER = Object.keys(ABILITY_LABELS_PT) as (keyof AbilityScores)[];

type BeyondAbilityRowProps = {
  scores: AbilityScores;
  onEdit?: () => void;
};

export function BeyondAbilityRow({ scores, onEdit }: BeyondAbilityRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ORDER.map((key) => {
        const score = scores[key];
        return (
          <button
            key={key}
            type="button"
            onClick={onEdit}
            title={ABILITY_LABELS_PT[key]}
            className={cn(
              "group relative flex flex-col items-center rounded-lg border border-border/70",
              "bg-card/70 px-2 py-2.5",
              "transition-colors hover:border-primary/45 hover:bg-primary/5",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase group-hover:text-primary">
              {ABILITY_SHORT[key]}
            </span>
            <span className="font-heading mt-1 text-3xl font-semibold tabular-nums leading-none tracking-tight">
              {abilityModifier(score)}
            </span>
            <span className="mt-2 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              {score}
            </span>
          </button>
        );
      })}
    </div>
  );
}
