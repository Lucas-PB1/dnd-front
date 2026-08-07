"use client";

import type { ComponentType, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type CombatMetricProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  emphasize?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  progressPercent?: number;
  /** Tokens chart-* do tema Grimoire (docs/COLORS.md). */
  progressColor?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  badge?: ReactNode;
};

export function CombatMetric({
  label,
  value,
  hint,
  icon: Icon,
  emphasize = false,
  onClick,
  disabled,
  progressPercent,
  progressColor = "chart-3",
  badge,
}: CombatMetricProps) {
  const colorMap = {
    "chart-1": "bg-chart-1",
    "chart-2": "bg-chart-2",
    "chart-3": "bg-chart-3",
    "chart-4": "bg-chart-4",
    "chart-5": "bg-chart-5",
  };

  const className = cn(
    "group relative flex min-w-0 flex-col items-center justify-center rounded-lg border px-2.5 py-1.5 text-center transition-all duration-200",
    emphasize
      ? "border-primary/50 bg-primary/10"
      : "border-border/60 bg-card/60 hover:bg-card/90",
    onClick &&
      "cursor-pointer hover:border-primary/60 disabled:pointer-events-none disabled:opacity-60",
  );

  const body = (
    <>
      <div className="flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {Icon ? (
          <Icon className="size-3 text-primary" aria-hidden />
        ) : null}
        <span>{label}</span>
        {badge ? <span className="ml-0.5">{badge}</span> : null}
      </div>

      <span className="font-heading mt-0.5 text-xl font-bold leading-none tabular-nums tracking-tight text-foreground">
        {value}
      </span>

      {progressPercent != null ? (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              colorMap[progressColor],
            )}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      ) : null}

      {hint ? (
        <span className="mt-0.5 max-w-full truncate text-[0.65rem] font-medium text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled}
        title={`Rolar ${label.toLowerCase()}`}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
