"use client";

import { useCallback, useState } from "react";

import type { Ability } from "@/domain/character-sheet/constants";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
} from "@/domain/character-sheet/constants";
import {
  canDecreasePointBuy,
  canIncreasePointBuy,
  createDefaultPointBuyScores,
  decreasePointBuy,
  formatAbilityModifierValue,
  getPointBuyCost,
  getPointBuyRemaining,
  getPointBuyTotalSpent,
  increasePointBuy,
  isPointBuyComplete,
  abilityModifier,
  POINT_BUY_COSTS,
  POINT_BUY_MAX_SCORE,
  POINT_BUY_MIN_SCORE,
  POINT_BUY_TOTAL,
  type AbilityScores,
} from "@/domain/character-sheet/ability-score-generation";
import { ABILITY_GENERATION_UI } from "@/presentation/components/character-sheet/ability-generation/ability-generation-labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AbilityPointBuyPanelProps = {
  onChange: (scores: AbilityScores, complete: boolean) => void;
};

export function AbilityPointBuyPanel({ onChange }: AbilityPointBuyPanelProps) {
  const [scores, setScores] = useState<AbilityScores>(
    createDefaultPointBuyScores,
  );

  const sync = useCallback(
    (next: AbilityScores) => {
      setScores(next);
      onChange(next, isPointBuyComplete(next));
    },
    [onChange],
  );

  const adjust = (ability: Ability, delta: 1 | -1) => {
    const next =
      delta === 1
        ? increasePointBuy(scores, ability)
        : decreasePointBuy(scores, ability);

    if (next) {
      sync(next);
    }
  };

  const spent = getPointBuyTotalSpent(scores);
  const remaining = getPointBuyRemaining(scores);
  const complete = isPointBuyComplete(scores);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {ABILITY_GENERATION_UI.pointBuyHint}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs",
            complete
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {remaining} {ABILITY_GENERATION_UI.pointsRemaining}
        </span>
        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
          {spent} {ABILITY_GENERATION_UI.pointsSpent}
        </span>
        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
          {POINT_BUY_MIN_SCORE}–{POINT_BUY_MAX_SCORE} · {POINT_BUY_TOTAL} pts
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => sync(createDefaultPointBuyScores())}
        >
          {ABILITY_GENERATION_UI.resetPointBuy}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => {
          const score = scores[ability];
          const cost = getPointBuyCost(score);

          return (
            <div
              key={ability}
              className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ABILITY_ABBREV[ability]} · {cost} pt
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">{score}</span>
                <span className="text-sm text-muted-foreground">
                  {formatAbilityModifierValue(abilityModifier(score))}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1"
                  disabled={!canDecreasePointBuy(scores, ability)}
                  onClick={() => adjust(ability, -1)}
                  aria-label={`Diminuir ${ABILITY_LABELS[ability]}`}
                >
                  −
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1"
                  disabled={!canIncreasePointBuy(scores, ability)}
                  onClick={() => adjust(ability, 1)}
                  aria-label={`Aumentar ${ABILITY_LABELS[ability]}`}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {!complete ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {ABILITY_GENERATION_UI.pointBuyIncomplete}
        </p>
      ) : null}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium">
          {ABILITY_GENERATION_UI.costTable}
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
          {Object.entries(POINT_BUY_COSTS).map(([score, cost]) => (
            <span key={score}>
              {score}: {cost} pt
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}
