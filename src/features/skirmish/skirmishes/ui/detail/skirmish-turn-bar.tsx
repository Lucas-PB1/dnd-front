"use client";

import { ArrowRightIcon, BoltIcon } from "@heroicons/react/24/outline";

import type { SessionCombatStatusLine } from "@/features/character/character-sheet/lib/combat/session-combat-status";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

function AttackBudgetMeter({
  remaining,
  max,
}: {
  remaining: number;
  max: number;
}) {
  const cappedMax = Math.max(1, max);
  const cappedRemaining = Math.min(cappedMax, Math.max(0, remaining));
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`${cappedRemaining} de ${cappedMax} ataques restantes neste turno`}
    >
      {Array.from({ length: cappedMax }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full",
            index < cappedRemaining ? "bg-secondary" : "bg-muted",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

type SkirmishTurnBarProps = {
  myTurn: boolean;
  creatureActing: boolean;
  creatureStatusText: string | null;
  round: number;
  attacksRemaining: number | null;
  attacksPerAction: number | null;
  statusLines: SessionCombatStatusLine[];
  canAttack: boolean;
  attackPending: boolean;
  endTurnPending: boolean;
  onAttack: () => void;
  onEndTurn: () => void;
};

export function SkirmishTurnBar({
  myTurn,
  creatureActing,
  creatureStatusText,
  round,
  attacksRemaining,
  attacksPerAction,
  statusLines,
  canAttack,
  attackPending,
  endTurnPending,
  onAttack,
  onEndTurn,
}: SkirmishTurnBarProps) {
  const budgetMax =
    attacksPerAction != null && attacksPerAction > 0
      ? attacksPerAction
      : attacksRemaining != null && attacksRemaining > 0
        ? attacksRemaining
        : null;
  const showBudget =
    myTurn &&
    !creatureActing &&
    attacksRemaining != null &&
    budgetMax != null;

  return (
    <div
      className={cn(
        "sticky z-20 space-y-2 rounded-xl border border-border/80 bg-background/90 p-3 shadow-sm backdrop-blur-md",
        "bottom-2 sm:top-2 sm:bottom-auto",
      )}
    >
      {creatureActing ? (
        <p className="text-sm font-medium text-secondary" role="status">
          {creatureStatusText ?? "A criatura age…"}
        </p>
      ) : myTurn ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <p className="font-medium text-foreground">
            Seu turno · Rodada {round}
          </p>
          {showBudget ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <AttackBudgetMeter
                remaining={attacksRemaining}
                max={budgetMax}
              />
              <span className="text-xs tabular-nums">
                {attacksRemaining} atq.
              </span>
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Turno da criatura · Rodada {round}
        </p>
      )}

      {statusLines.length > 0 ? (
        <p className="truncate text-xs text-secondary">
          {statusLines.map((line) => line.label).join(" · ")}
        </p>
      ) : null}

      {myTurn && !creatureActing ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="inline-flex items-center gap-1.5"
            disabled={!canAttack}
            onClick={onAttack}
          >
            <BoltIcon className="size-4" aria-hidden />
            {attackPending ? "Resolvendo…" : "Atacar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="inline-flex items-center gap-1.5"
            disabled={endTurnPending}
            onClick={onEndTurn}
          >
            <ArrowRightIcon className="size-4" aria-hidden />
            {endTurnPending ? "Passando…" : "Passar turno"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
