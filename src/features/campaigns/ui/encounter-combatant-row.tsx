"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type {
  AdvantageMode,
  EncounterCombatant,
} from "@/features/campaigns/api/encounters.api";

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

function hpLabel(combatant: EncounterCombatant): string {
  if (combatant.hpCurrent != null && combatant.hpMax != null) {
    return `${combatant.hpCurrent}/${combatant.hpMax}`;
  }
  if (combatant.hpPercent != null) return `${combatant.hpPercent}%`;
  if (combatant.kind === "creature") return "PV oculto";
  return "—";
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

  const init =
    combatant.initiativeTotal != null
      ? `${combatant.initiativeTotal}`
      : "—";
  const mod =
    combatant.initiativeModifier != null
      ? ` (${combatant.initiativeModifier >= 0 ? "+" : ""}${combatant.initiativeModifier})`
      : "";

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
        "flex flex-col gap-2 border-b border-border px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        combatant.isCurrentTurn && "bg-secondary/15",
        !combatant.isActive && "opacity-50",
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {combatant.isCurrentTurn ? (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
              Turno
            </span>
          ) : null}
          <p className="truncate text-sm font-semibold">{combatant.displayName}</p>
          <span className="text-xs text-muted-foreground">
            {combatant.kind === "pc" ? "PC" : "Criatura"}
            {combatant.level != null ? ` · Nv ${combatant.level}` : null}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Init {init}
          {mod}
          {combatant.armorClass != null ? ` · CA ${combatant.armorClass}` : null}
          {` · ${hpLabel(combatant)}`}
        </p>
        {combatant.kind === "pc" && combatant.featSlugs.length > 0 ? (
          <p className="truncate text-xs text-muted-foreground">
            Talentos: {combatant.featSlugs.join(", ")}
          </p>
        ) : null}
        {combatant.kind === "pc" && combatant.conditions.length > 0 ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {combatant.conditions.join(", ")}
          </p>
        ) : null}
        {combatant.kind === "pc" && combatant.inspiration ? (
          <p className="text-xs text-muted-foreground">Inspiração</p>
        ) : null}
        {combatant.hpPercent != null &&
        combatant.hpCurrent == null &&
        combatant.kind === "creature" ? (
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-secondary"
              style={{ width: `${combatant.hpPercent}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {canRoll && combatant.initiativeTotal == null ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
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
