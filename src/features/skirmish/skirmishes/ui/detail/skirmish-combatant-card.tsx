import type { SkirmishCombatant } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import { cn } from "@/shared/lib/utils";

export function SkirmishCombatantCard({
  combatant,
  isWinner,
  hpCurrent,
  tookHit,
  acting,
}: {
  combatant: SkirmishCombatant;
  isWinner: boolean;
  hpCurrent: number;
  tookHit: boolean;
  acting: boolean;
}) {
  const hpMax = combatant.hpMax ?? 0;
  const ratio = hpMax > 0 ? Math.min(1, hpCurrent / hpMax) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        combatant.isCurrentTurn || acting
          ? "border-secondary bg-secondary/5"
          : "border-border/80",
        acting && "skirmish-card-turn",
        tookHit && "skirmish-card-hit",
        isWinner && "ring-1 ring-accent/60",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading text-lg font-semibold">
          {combatant.displayName}
        </p>
        <p className="text-sm text-muted-foreground">
          {combatant.kind === "pc" ? "Personagem" : "Criatura"}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        CA {combatant.armorClass ?? "—"}
        {combatant.initiativeTotal != null
          ? ` · Iniciativa ${combatant.initiativeTotal}`
          : null}
        {acting ? " · atacando" : combatant.isCurrentTurn ? " · turno" : null}
      </p>
      {combatant.conditions.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Condições: {combatant.conditions.join(", ")}
        </p>
      ) : null}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span>PV</span>
          <span>
            {hpCurrent}/{hpMax}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="skirmish-hp-fill h-full bg-secondary"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
