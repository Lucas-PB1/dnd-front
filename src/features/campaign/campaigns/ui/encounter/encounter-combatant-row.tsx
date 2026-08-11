"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  AdvantageMode,
  EncounterCombatant,
} from "@/features/campaign/campaigns/api/encounters.api";

type Props = {
  combatant: EncounterCombatant;
  canManage: boolean;
  canRoll: boolean;
  busy?: boolean;
  advantage: AdvantageMode;
  onRoll: () => void;
  onHpSet?: (hpCurrent: number) => void;
  onRemove?: () => void;
};

function hpPercentValue(combatant: EncounterCombatant): number | null {
  if (combatant.hpPercent != null) return combatant.hpPercent;
  if (
    combatant.hpCurrent != null &&
    combatant.hpMax != null &&
    combatant.hpMax > 0
  ) {
    return Math.round((combatant.hpCurrent / combatant.hpMax) * 100);
  }
  return null;
}

function hpBarClass(percent: number): string {
  if (percent > 50) return "bg-chart-3";
  if (percent >= 25) return "bg-chart-2";
  return "bg-chart-1";
}

export function EncounterCombatantRow({
  combatant,
  canManage,
  canRoll,
  busy,
  advantage,
  onRoll,
  onHpSet,
  onRemove,
}: Props) {
  const [hpDraft, setHpDraft] = useState<string | null>(null);
  const hpDisplay =
    hpDraft ??
    (combatant.hpCurrent != null ? String(combatant.hpCurrent) : "");

  const initTotal = combatant.initiativeTotal;
  const mod =
    combatant.initiativeModifier != null
      ? `${combatant.initiativeModifier >= 0 ? "+" : ""}${combatant.initiativeModifier}`
      : null;
  const percent = hpPercentValue(combatant);

  function commitHp() {
    if (!onHpSet || combatant.hpCurrent == null) return;
    const next = Number(hpDisplay);
    if (!Number.isFinite(next) || next < 0) {
      setHpDraft(null);
      return;
    }
    const capped =
      combatant.hpMax != null ? Math.min(next, combatant.hpMax) : next;
    if (capped !== combatant.hpCurrent) onHpSet(capped);
    setHpDraft(null);
  }

  return (
    <li
      className={cn(
        "relative flex flex-col gap-3 border-b border-border/70 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-4",
        combatant.isCurrentTurn && "bg-secondary/12",
        !combatant.isActive && "opacity-50",
        combatant.kind === "creature" && !combatant.isCurrentTurn && "bg-muted/15",
      )}
    >
      {combatant.isCurrentTurn ? (
        <span
          className="absolute inset-y-0 left-0 w-1 bg-secondary"
          aria-hidden
        />
      ) : null}

      <div className="flex w-16 shrink-0 flex-col items-center justify-center text-center sm:w-20">
        <span className="text-[0.55rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Init
        </span>
        <span className="font-heading text-2xl font-semibold tabular-nums leading-none">
          {initTotal != null ? initTotal : "—"}
        </span>
        {mod ? (
          <span className="mt-0.5 text-[0.65rem] tabular-nums text-muted-foreground">
            {mod}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {combatant.isCurrentTurn ? (
            <span className="rounded-sm border border-secondary/50 bg-secondary/20 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-secondary uppercase">
              Turno
            </span>
          ) : null}
          <p className="truncate font-heading text-sm font-semibold sm:text-base">
            {combatant.displayName}
          </p>
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[0.65rem]",
              combatant.kind === "pc"
                ? "border-secondary/40 bg-secondary/10 text-secondary"
                : "border-border/80 bg-muted/30 text-muted-foreground",
            )}
          >
            {combatant.kind === "pc" ? "PC" : "Criatura"}
            {combatant.level != null ? ` · Nv ${combatant.level}` : null}
          </span>
          {combatant.inspiration ? (
            <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[0.65rem] text-accent">
              Inspiração
            </span>
          ) : null}
        </div>

        {combatant.conditions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {combatant.conditions.map((condition) => (
              <span
                key={condition}
                className="rounded-md border border-amber-600/35 bg-amber-500/10 px-1.5 py-0.5 text-[0.65rem] text-amber-800 dark:text-amber-300"
              >
                {condition}
              </span>
            ))}
          </div>
        ) : null}

        {combatant.kind === "pc" && combatant.featSlugs.length > 0 ? (
          <p className="truncate text-[0.7rem] text-muted-foreground" title={combatant.featSlugs.join(", ")}>
            Talentos: {combatant.featSlugs.join(", ")}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-1 sm:w-16 sm:items-center">
        <span className="text-[0.55rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          CA
        </span>
        <span className="font-heading text-lg font-semibold tabular-nums leading-none">
          {combatant.armorClass ?? "—"}
        </span>
      </div>

      <div className="flex min-w-[7.5rem] shrink-0 flex-col gap-1 sm:w-36">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[0.55rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            PV
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {combatant.hpCurrent != null && combatant.hpMax != null
              ? `${combatant.hpCurrent}/${combatant.hpMax}`
              : combatant.hpPercent != null
                ? `${combatant.hpPercent}%`
                : combatant.kind === "creature"
                  ? "oculto"
                  : "—"}
          </span>
        </div>
        {percent != null ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full transition-[width]", hpBarClass(percent))}
              style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
            />
          </div>
        ) : (
          <div className="h-1.5 rounded-full bg-muted/50" aria-hidden />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        {canRoll && combatant.initiativeTotal == null ? (
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={onRoll}
            title={
              advantage === "normal"
                ? "Iniciativa"
                : advantage === "advantage"
                  ? "Com vantagem"
                  : "Com desvantagem"
            }
          >
            Rolar init
            {advantage === "advantage"
              ? " (vant.)"
              : advantage === "disadvantage"
                ? " (desvant.)"
                : ""}
          </Button>
        ) : null}
        {canManage &&
        combatant.kind === "creature" &&
        combatant.hpCurrent != null &&
        onHpSet ? (
          <>
            <Input
              type="number"
              min={0}
              className="h-8 w-16"
              value={hpDisplay}
              disabled={busy}
              onChange={(e) => setHpDraft(e.target.value)}
              onBlur={commitHp}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitHp();
                }
              }}
              aria-label="PV atual"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onHpSet(Math.max(0, combatant.hpCurrent! - 1))}
            >
              −1
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                onHpSet(
                  combatant.hpMax != null
                    ? Math.min(combatant.hpMax, combatant.hpCurrent! + 1)
                    : combatant.hpCurrent! + 1,
                )
              }
            >
              +1
            </Button>
          </>
        ) : null}
        {canManage && onRemove ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={onRemove}
          >
            Remover
          </Button>
        ) : null}
      </div>
    </li>
  );
}
