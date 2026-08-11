"use client";

import { useEffect, useState } from "react";

import type { InventoryItem } from "@/entities/character/session-types";
import {
  formatCoinPurse,
  halfCoinPurseClient,
  parseCostTextClient,
  scaleCoinPurseClient,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-coin-purse";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type BeyondSellDialogProps = {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onConfirm: (input: {
    quantity: number;
    mode: "sell" | "discard";
  }) => Promise<void>;
};

/** Venda parcial (½) ou descarte sem crédito. */
export function BeyondSellDialog({
  item,
  open,
  onOpenChange,
  pending,
  onConfirm,
}: BeyondSellDialogProps) {
  const [qty, setQty] = useState("1");
  const max = item?.quantity ?? 1;

  useEffect(() => {
    if (open && item) setQty(String(item.quantity));
  }, [open, item]);

  const quantity = Math.min(max, Math.max(1, Math.trunc(Number(qty)) || 1));
  const unit = parseCostTextClient(item?.costText);
  const credit =
    unit != null
      ? halfCoinPurseClient(scaleCoinPurseClient(unit, quantity)!)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender ou descartar</DialogTitle>
          <DialogDescription>
            {item
              ? `${item.itemName} — escolha quantidade e se vende (½) ou descarta.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="sell-qty">Quantidade</FieldLabel>
            <Input
              id="sell-qty"
              type="number"
              min={1}
              max={max}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-24 font-mono"
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Crédito se vender:{" "}
            {credit ? formatCoinPurse(credit) : "sem preço de catálogo"}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              void onConfirm({ quantity, mode: "discard" })
            }
          >
            Descartar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void onConfirm({ quantity, mode: "sell" })}
            >
              Vender
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
