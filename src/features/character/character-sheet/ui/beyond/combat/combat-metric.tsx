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
  progressColor?: "emerald" | "amber" | "rose" | "indigo" | "sky";
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
  progressColor = "emerald",
  badge,
}: CombatMetricProps) {
  const colorMap = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-500",
    sky: "bg-sky-500",
  };

  const className = cn(
    "group relative flex min-w-0 flex-col items-center justify-center rounded-xl border px-3.5 py-2.5 text-center transition-all duration-200 backdrop-blur-md shadow-sm",
    emphasize
      ? "border-primary/50 bg-primary/10 shadow-[0_0_12px_rgba(168,85,247,0.12)]"
      : "border-border/60 bg-card/60 hover:bg-card/90",
    onClick &&
      "cursor-pointer hover:scale-[1.02] hover:border-primary/60 hover:shadow-md disabled:opacity-60 disabled:pointer-events-none",
  );

  const body = (
    <>
      <div className="flex items-center gap-1 text-[0.62rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {Icon ? (
          <Icon className="size-3.5 text-primary group-hover:scale-110 transition-transform" aria-hidden />
        ) : null}
        <span>{label}</span>
        {badge ? <span className="ml-1">{badge}</span> : null}
      </div>

      <span className="font-heading mt-1 text-2xl font-bold leading-none tabular-nums tracking-tight text-foreground">
        {value}
      </span>

      {progressPercent != null ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              colorMap[progressColor],
            )}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      ) : null}

      {hint ? (
        <span className="mt-1 max-w-full truncate text-[0.68rem] text-muted-foreground font-medium">
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
