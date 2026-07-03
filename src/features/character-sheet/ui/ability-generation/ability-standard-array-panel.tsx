"use client";

import { useCallback, useState } from "react";

import type { Ability } from "@/entities/character-sheet/constants";
import {
  createEmptyAssignment,
  isAssignmentComplete,
  STANDARD_ABILITY_ARRAY,
} from "@/entities/character-sheet/ability-score-generation";
import { AbilityAssignmentGrid } from "@/features/character-sheet/ui/ability-generation/ability-assignment-grid";
import { ABILITY_GENERATION_UI } from "@/features/character-sheet/ui/ability-generation/ability-generation-labels";
import { Button } from "@/shared/ui/button";

type AbilityStandardArrayPanelProps = {
  onAssignmentChange: (
    assigned: Record<Ability, number | null>,
    complete: boolean,
  ) => void;
};

export function AbilityStandardArrayPanel({
  onAssignmentChange,
}: AbilityStandardArrayPanelProps) {
  const [pool, setPool] = useState<number[]>([...STANDARD_ABILITY_ARRAY]);
  const [assigned, setAssigned] = useState(createEmptyAssignment);

  const syncParent = useCallback(
    (nextAssigned: Record<Ability, number | null>) => {
      onAssignmentChange(nextAssigned, isAssignmentComplete(nextAssigned));
    },
    [onAssignmentChange],
  );

  const handleReset = () => {
    const empty = createEmptyAssignment();
    setAssigned(empty);
    setPool([...STANDARD_ABILITY_ARRAY]);
    syncParent(empty);
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
      syncParent(nextAssigned);
      return nextAssigned;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {ABILITY_GENERATION_UI.standardHint}
      </p>

      <div>
        <Button type="button" size="sm" variant="outline" onClick={handleReset}>
          {ABILITY_GENERATION_UI.resetArray}
        </Button>
      </div>

      <AbilityAssignmentGrid
        assigned={assigned}
        pool={pool}
        onAssign={handleAssign}
      />
    </div>
  );
}
