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
};

export function CombatMetric({
  label,
  value,
  hint,
  icon: Icon,
  emphasize = false,
  onClick,
  disabled,
}: CombatMetricProps) {
  const className = cn(
    "flex min-w-0 flex-col items-center justify-center rounded-lg border px-3 py-2 text-center",
    emphasize
      ? "border-primary/45 bg-primary/8"
      : "border-border/70 bg-card/70",
    onClick && "hover:border-primary/50 hover:bg-primary/10 disabled:opacity-60",
  );

  const body = (
    <>
      <span className="inline-flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3 text-secondary" aria-hidden /> : null}
        {label}
      </span>
      <span className="font-heading mt-0.5 text-2xl font-semibold leading-none tabular-nums">
        {value}
      </span>
      {hint ? (
        <span className="mt-1 max-w-full truncate text-[0.65rem] text-muted-foreground">
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
