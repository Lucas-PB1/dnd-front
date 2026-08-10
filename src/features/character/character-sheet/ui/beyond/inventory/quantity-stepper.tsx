"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type QuantityStepperProps = {
  id: string;
  value: string;
  onChange: (next: string) => void;
  onCommit: (next: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  /** Default 1 (quantidade de itens). Use 0 para moedas. */
  min?: number;
};

export function QuantityStepper({
  id,
  value,
  onChange,
  onCommit,
  disabled,
  ariaLabel,
  min = 1,
}: QuantityStepperProps) {
  const parsed = Math.trunc(Number(value));
  const numeric = Number.isFinite(parsed)
    ? Math.max(min, parsed)
    : min;

  return (
    <div className="inline-flex items-center rounded-md border border-border/80 bg-background/60">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="rounded-none rounded-l-md"
        aria-label="Diminuir quantidade"
        disabled={disabled || numeric <= min}
        onClick={() => onCommit(numeric - 1)}
      >
        <MinusIcon className="size-3.5" aria-hidden />
      </Button>
      <Input
        id={id}
        type="number"
        min={min}
        inputMode="numeric"
        aria-label={ariaLabel}
        className="h-7 w-11 rounded-none border-0 border-x border-border/80 bg-transparent px-1 text-center font-mono text-xs tabular-nums shadow-none focus-visible:ring-0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit(numeric)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit(numeric);
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="rounded-none rounded-r-md"
        aria-label="Aumentar quantidade"
        disabled={disabled}
        onClick={() => onCommit(numeric + 1)}
      >
        <PlusIcon className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}
