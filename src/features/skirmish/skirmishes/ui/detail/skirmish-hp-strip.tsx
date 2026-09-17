"use client";

import type { SkirmishCombatant } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import { cn } from "@/shared/lib/utils";

function HpSide({
  combatant,
  hpCurrent,
  tookHit,
  acting,
  isWinner,
}: {
  combatant: SkirmishCombatant;
  hpCurrent: number;
  tookHit: boolean;
  acting: boolean;
  isWinner: boolean;
}) {
  const hpMax = combatant.hpMax ?? 0;
  const ratio = hpMax > 0 ? Math.min(1, Math.max(0, hpCurrent / hpMax)) : 0;
  const active = combatant.isCurrentTurn || acting;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 space-y-1 rounded-lg border px-2.5 py-2",
        active ? "border-secondary bg-secondary/5" : "border-border/70",
        acting && "skirmish-card-turn",
        tookHit && "skirmish-card-hit",
        isWinner && "ring-1 ring-accent/60",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-heading text-sm font-semibold">
          {combatant.displayName}
        </p>
        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
          CA {combatant.armorClass ?? "—"}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {acting
            ? "atacando"
            : combatant.isCurrentTurn
              ? "turno"
              : combatant.kind === "pc"
                ? "você"
                : "criatura"}
        </span>
        <span className="tabular-nums font-medium">
          {hpCurrent}/{hpMax}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="skirmish-hp-fill h-full bg-secondary"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

type SkirmishHpStripProps = {
  pc: SkirmishCombatant | undefined;
  actor: SkirmishCombatant | undefined;
  pcHp: number;
  actorHp: number;
  pcTookHit: boolean;
  actorActing: boolean;
  pcWinner: boolean;
  actorWinner: boolean;
};

export function SkirmishHpStrip({
  pc,
  actor,
  pcHp,
  actorHp,
  pcTookHit,
  actorActing,
  pcWinner,
  actorWinner,
}: SkirmishHpStripProps) {
  return (
    <div className="flex gap-2" aria-label="Combatentes">
      {pc ? (
        <HpSide
          combatant={pc}
          hpCurrent={pcHp}
          tookHit={pcTookHit}
          acting={false}
          isWinner={pcWinner}
        />
      ) : null}
      {actor ? (
        <HpSide
          combatant={actor}
          hpCurrent={actorHp}
          tookHit={false}
          acting={actorActing}
          isWinner={actorWinner}
        />
      ) : null}
    </div>
  );
}
