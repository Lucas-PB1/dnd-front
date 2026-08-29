"use client";

import type { ReactNode } from "react";

import type { LocalRollResult } from "@/shared/lib/dice";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/design-system/primitives/button";

export function LocalRollResultBanner({
  result,
  onDismiss,
}: {
  result: LocalRollResult | null;
  onDismiss: () => void;
}) {
  if (!result) return null;

  const faces =
    result.kept && result.kept.length > 0
      ? `mantido ${result.kept.join(", ")} · rolado [${result.rolls.join(", ")}]`
      : `rolado [${result.rolls.join(", ")}]`;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-primary/40 bg-card/95 p-3 shadow-lg backdrop-blur",
        "sm:inset-x-auto sm:right-4 sm:left-auto sm:bottom-4",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {result.label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-primary">
            {result.total}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {result.expression}
            {result.critical ? " · crítico" : ""}
          </p>
          {result.note ? (
            <p className="mt-0.5 text-[0.7rem] text-secondary">{result.note}</p>
          ) : null}
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground/90">{faces}</p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
          Fechar
        </Button>
      </div>
    </div>
  );
}

export function RollChip({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex min-h-9 items-center rounded-md border border-primary/25 bg-primary/5 px-2.5 py-1.5 font-mono text-xs font-semibold touch-manipulation text-primary transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0 sm:py-0.5"
    >
      {children}
    </button>
  );
}

const MODE_OPTIONS: { id: "normal" | "advantage" | "disadvantage"; label: string }[] =
  [
    { id: "normal", label: "Normal" },
    { id: "advantage", label: "Vant." },
    { id: "disadvantage", label: "Desv." },
  ];

export function RollModeToolbar({
  advantage,
  onAdvantageChange,
  critical,
  onCriticalChange,
}: {
  advantage: "normal" | "advantage" | "disadvantage";
  onAdvantageChange: (mode: "normal" | "advantage" | "disadvantage") => void;
  critical: boolean;
  onCriticalChange: (value: boolean) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Modo de rolagem"
    >
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={cn(
            "min-h-9 rounded-md border px-2.5 py-1.5 text-[0.7rem] font-medium touch-manipulation transition-colors sm:min-h-0 sm:py-0.5",
            advantage === option.id
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
          )}
          aria-pressed={advantage === option.id}
          onClick={() => onAdvantageChange(option.id)}
        >
          {option.label}
        </button>
      ))}
      <button
        type="button"
        className={cn(
          "min-h-9 rounded-md border px-2.5 py-1.5 text-[0.7rem] font-medium touch-manipulation transition-colors sm:min-h-0 sm:py-0.5",
          critical
            ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
            : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
        )}
        aria-pressed={critical}
        title="Dobra os dados de dano (PHB 2024)"
        onClick={() => onCriticalChange(!critical)}
      >
        Crítico
      </button>
    </div>
  );
}
