"use client";

import { useCallback, useState } from "react";

import type { Ability } from "@/entities/character-sheet/constants";
import {
  createEmptyAssignment,
  isAssignmentComplete,
  isRollSumInRange,
  rollSixAbilities,
  sumRollPool,
  type AbilityRollDetail,
} from "@/entities/character-sheet/ability-score-generation";
import { AbilityAssignmentGrid } from "@/features/character-sheet/ui/ability-generation/ability-assignment-grid";
import { ABILITY_GENERATION_UI } from "@/features/character-sheet/ui/ability-generation/ability-generation-labels";
import { Button } from "@/shared/ui/button";

type AbilityRollPanelProps = {
  onAssignmentChange: (
    assigned: Record<Ability, number | null>,
    complete: boolean,
  ) => void;
};

export function AbilityRollPanel({
  onAssignmentChange,
}: AbilityRollPanelProps) {
  const [pool, setPool] = useState<number[]>([]);
  const [assigned, setAssigned] = useState(createEmptyAssignment);
  const [rollDetails, setRollDetails] = useState<AbilityRollDetail[]>([]);

  const syncParent = useCallback(
    (nextAssigned: Record<Ability, number | null>, nextPool: number[]) => {
      const sumInRange = isRollSumInRange(sumRollPool(nextPool));
      onAssignmentChange(
        nextAssigned,
        sumInRange && isAssignmentComplete(nextAssigned),
      );
    },
    [onAssignmentChange],
  );

  const handleRoll = () => {
    const rolls = rollSixAbilities();
    setRollDetails(rolls);
    const nextPool = rolls.map((roll) => roll.value);
    setPool(nextPool);
    const empty = createEmptyAssignment();
    setAssigned(empty);
    syncParent(empty, nextPool);
  };

  const handleAssign = (ability: Ability, value: number | null) => {
    setAssigned((previous) => {
      const current = previous[ability];
      const nextPool = [...pool];

      if (current != null) {
        nextPool.push(current);
      }

      if (value != null) {
        const index = nextPool.indexOf(value);
        if (index >= 0) {
          nextPool.splice(index, 1);
        }
      }

      setPool(nextPool);
      const nextAssigned = { ...previous, [ability]: value };
      syncParent(nextAssigned, nextPool);
      return nextAssigned;
    });
  };

  const rollSum = sumRollPool(pool);
  const sumInRange = pool.length === 0 || isRollSumInRange(rollSum);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {ABILITY_GENERATION_UI.rollHint}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={handleRoll}>
          {pool.length > 0
            ? ABILITY_GENERATION_UI.reroll
            : ABILITY_GENERATION_UI.rollButton}
        </Button>
        {pool.length > 0 ? (
          <span
            className={
              sumInRange
                ? "text-xs text-muted-foreground"
                : "text-xs text-destructive"
            }
          >
            {ABILITY_GENERATION_UI.totalSum}: {rollSum}
            {!sumInRange ? ` · ${ABILITY_GENERATION_UI.rollOutOfRange}` : null}
          </span>
        ) : null}
      </div>

      {rollDetails.length > 0 ? (
        <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {rollDetails.map((roll, index) => (
            <li key={index}>
              {roll.dice.join(", ")} → {roll.value} (
              {ABILITY_GENERATION_UI.dropped}: {roll.dropped})
            </li>
          ))}
        </ul>
      ) : null}

      {pool.length > 0 && sumInRange ? (
        <AbilityAssignmentGrid
          assigned={assigned}
          pool={pool}
          onAssign={handleAssign}
        />
      ) : null}
    </div>
  );
}
