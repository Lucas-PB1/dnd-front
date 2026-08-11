"use client";

import type { CoinPurse } from "@/entities/character/types";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "@/shared/ui/field";

/** PHB Coin Values — cobre por unidade (1 PO = 100 PC). */
const COPPER_PER: Record<keyof CoinPurse, number> = {
  copper: 1,
  silver: 10,
  electrum: 50,
  gold: 100,
  platinum: 1000,
};

const COIN_ROWS: Array<{
  key: keyof CoinPurse;
  label: string;
  title: string;
  vsGold: string;
}> = [
  { key: "copper", label: "PC", title: "Cobre", vsGold: "1/100 PO" },
  { key: "silver", label: "PP", title: "Prata", vsGold: "1/10 PO" },
  { key: "electrum", label: "PE", title: "Electrum", vsGold: "1/2 PO" },
  { key: "gold", label: "PO", title: "Ouro", vsGold: "1 PO" },
  { key: "platinum", label: "PL", title: "Platina", vsGold: "10 PO" },
];

type BeyondCoinPurseProps = {
  wealth: CoinPurse;
  disabled?: boolean;
  onChangeCoin: (key: keyof CoinPurse, value: number) => void;
};

export function purseToCopperClient(purse: CoinPurse): number {
  return (Object.keys(COPPER_PER) as Array<keyof CoinPurse>).reduce(
    (sum, key) => sum + purse[key] * COPPER_PER[key],
    0,
  );
}

/** Saldo das 5 moedas + steppers para ajuste (dono/DM). */
export function BeyondCoinPurse({
  wealth,
  disabled,
  onChangeCoin,
}: BeyondCoinPurseProps) {
  const totalCopper = purseToCopperClient(wealth);
  const totalGold = totalCopper / 100;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Moedas</p>
        <p
          className="font-mono text-xs tabular-nums text-muted-foreground"
          title="Equivalente total (câmbio PHB)"
        >
          ≈ {totalGold.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}{" "}
          PO
        </p>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Câmbio PHB: 100 PC = 10 PP = 2 PE = 1 PO = 1/10 PL. A loja aceita
        qualquer mistura.
      </p>
      <div className="grid gap-2 sm:grid-cols-5">
        {COIN_ROWS.map((row) => (
          <div
            key={row.key}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md border border-border/70 bg-muted/20 px-2 py-1.5",
            )}
            title={`${row.title} (${row.vsGold})`}
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

/** Parse simples de costText do catálogo (milhar BR + tokens PT). */
export function parseCostTextClient(
  costText: string | null | undefined,
): CoinPurse | null {
  if (!costText?.trim() || /^varia$/i.test(costText.trim())) return null;
  const purse: CoinPurse = {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0,
  };
  const tokenToKey: Record<string, keyof CoinPurse> = {
    pc: "copper",
    pp: "silver",
    pe: "electrum",
    po: "gold",
    pl: "platinum",
    ppl: "platinum",
  };
  const matches = [
    ...costText.matchAll(
      /(\d{1,3}(?:\.\d{3})+|\d+)\s*(PC|PP|PE|PO|PL|PPl)\b/gi,
    ),
  ];
  if (!matches.length) return null;
  for (const match of matches) {
    const amount = Number(match[1]!.replace(/\./g, ""));
    const key = tokenToKey[match[2]!.toLowerCase()];
    if (!key || !Number.isFinite(amount)) return null;
    purse[key] += amount;
  }
  return purse;
}

export function scaleCoinPurseClient(
  purse: CoinPurse,
  quantity: number,
): CoinPurse {
  const q = Math.max(1, Math.trunc(quantity) || 1);
  return {
    copper: purse.copper * q,
    silver: purse.silver * q,
    electrum: purse.electrum * q,
    gold: purse.gold * q,
    platinum: purse.platinum * q,
  };
}

export function halfCoinPurseClient(purse: CoinPurse): CoinPurse {
  const half = Math.floor(purseToCopperClient(purse) / 2);
  let rest = half;
  const platinum = Math.floor(rest / 1000);
  rest -= platinum * 1000;
  const gold = Math.floor(rest / 100);
  rest -= gold * 100;
  const electrum = Math.floor(rest / 50);
  rest -= electrum * 50;
  const silver = Math.floor(rest / 10);
  rest -= silver * 10;
  return { platinum, gold, electrum, silver, copper: rest };
}
