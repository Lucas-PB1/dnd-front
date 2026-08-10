"use client";

import type { CoinPurse } from "@/entities/character/types";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "@/shared/ui/field";

const COIN_ROWS: Array<{
  key: keyof CoinPurse;
  label: string;
  title: string;
}> = [
  { key: "copper", label: "PC", title: "Cobre" },
  { key: "silver", label: "PP", title: "Prata" },
  { key: "electrum", label: "PE", title: "Electrum" },
  { key: "gold", label: "PO", title: "Ouro" },
  { key: "platinum", label: "PL", title: "Platina" },
];

type BeyondCoinPurseProps = {
  wealth: CoinPurse;
  disabled?: boolean;
  onChangeCoin: (key: keyof CoinPurse, value: number) => void;
};

/** Saldo das 5 moedas + steppers para ajuste (dono/DM). */
export function BeyondCoinPurse({
  wealth,
  disabled,
  onChangeCoin,
}: BeyondCoinPurseProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Moedas</p>
      <div className="grid gap-2 sm:grid-cols-5">
        {COIN_ROWS.map((row) => (
          <div
            key={row.key}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md border border-border/70 bg-muted/20 px-2 py-1.5",
            )}
            title={row.title}
          >
            <FieldLabel
              htmlFor={`coin-${row.key}`}
              className="shrink-0 font-mono text-xs"
            >
              {row.label}
            </FieldLabel>
            <QuantityStepper
              id={`coin-${row.key}`}
              value={String(wealth[row.key])}
              onChange={() => undefined}
              onCommit={(next) => onChangeCoin(row.key, Math.max(0, next))}
              disabled={disabled}
              ariaLabel={`${row.title} (${row.label})`}
              min={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function formatCoinPurse(purse: Partial<CoinPurse>): string {
  return COIN_ROWS.filter((row) => (purse[row.key] ?? 0) > 0)
    .map((row) => `${purse[row.key]} ${row.label}`)
    .join(" · ");
}
