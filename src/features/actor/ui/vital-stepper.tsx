"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type VitalStepperProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number | null;
  disabled?: boolean;
  onChange: (next: number) => void;
};

function clampVital(next: number, min: number, max: number | null): number {
  const truncated = Math.trunc(next);
  if (!Number.isFinite(truncated)) return min;
  if (max != null) return Math.max(min, Math.min(max, truncated));
  return Math.max(min, truncated);
}

/** PV / PV temp. com ±1 e valor digitável (Enter ou blur grava). */
export function VitalStepper({
  id,
  label,
  value,
  min = 0,
  max,
  disabled,
  onChange,
}: VitalStepperProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);
  const parsed = Math.trunc(Number(display));
  const numeric = Number.isFinite(parsed) ? parsed : value;
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  function commit(raw: number = numeric) {
    const next = clampVital(raw, min, max ?? null);
    if (next !== value) onChange(next);
    setDraft(null);
  }

  return (
    <div className="flex min-h-11 items-center gap-2">
      <label
        htmlFor={id}
        className="w-14 shrink-0 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0 touch-manipulation sm:size-9"
        disabled={disabled || atMin}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commit(numeric - 1)}
        aria-label={`Reduzir ${label}`}
      >
        <MinusIcon className="size-4" />
      </Button>
      <div className="flex min-w-[4.5rem] items-center justify-center gap-1">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max ?? undefined}
          value={display}
          disabled={disabled}
          aria-label={`${label} atual`}
          className="h-9 w-16 px-1 text-center text-sm font-semibold tabular-nums sm:h-8"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setDraft(null);
            }
          }}
        />
        {max != null ? (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
            / {max}
          </span>
        ) : null}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0 touch-manipulation sm:size-9"
        disabled={disabled || atMax}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commit(numeric + 1)}
        aria-label={`Aumentar ${label}`}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
}
