"use client";

import { useState } from "react";

import type { SpellSpiritVariant } from "@/entities/spell/types";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export type SpiritVariantChoice =
  | { spiritVariantKey: string }
  | { spiritSelections: { variantKey: string; count: number }[] };

type SpiritVariantDialogProps = {
  open: boolean;
  spellName: string;
  variants: SpellSpiritVariant[];
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (choice: SpiritVariantChoice) => void;
};

export function spiritVariantsNeedChoice(variants: SpellSpiritVariant[]) {
  return variants.length > 1;
}

export function SpiritVariantDialog({
  open,
  onOpenChange,
  ...formProps
}: SpiritVariantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-cy="spirit-variant-dialog">
        <SpiritVariantForm
          {...formProps}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function SpiritVariantForm({
  spellName,
  variants,
  busy,
  onCancel,
  onConfirm,
}: Omit<SpiritVariantDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void;
}) {
  const usesBudget = variants.some((variant) => variant.budgetCost > 1);
  const [selected, setSelected] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const totalCost = variants.reduce(
    (sum, variant) => sum + (counts[variant.variantKey] ?? 0) * variant.budgetCost,
    0,
  );
  const canConfirm = usesBudget ? totalCost > 0 : selected != null;

  function confirm() {
    if (usesBudget) {
      onConfirm({
        spiritSelections: variants
          .filter((variant) => (counts[variant.variantKey] ?? 0) > 0)
          .map((variant) => ({
            variantKey: variant.variantKey,
            count: counts[variant.variantKey],
          })),
      });
      return;
    }
    if (selected) onConfirm({ spiritVariantKey: selected });
  }

  return (
    <>
        <DialogHeader>
          <DialogTitle>{spellName}</DialogTitle>
          <DialogDescription>
            {usesBudget
              ? "Distribua os objetos por tamanho. Custo: Médio ou menor = 1, Grande = 2, Enorme = 3; o total não pode passar do seu modificador de conjuração."
              : "Escolha a forma do espírito invocado."}
          </DialogDescription>
        </DialogHeader>

        {usesBudget ? (
          <div className="grid gap-2">
            {variants.map((variant) => {
              const count = counts[variant.variantKey] ?? 0;
              return (
                <div
                  key={variant.variantKey}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium text-foreground">
                      {variant.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Custo {variant.budgetCost}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Remover ${variant.label}`}
                      disabled={busy || count === 0}
                      onClick={() =>
                        setCounts((prev) => ({
                          ...prev,
                          [variant.variantKey]: Math.max(0, count - 1),
                        }))
                      }
                    >
                      −
                    </Button>
                    <span className="w-6 text-center font-mono tabular-nums">
                      {count}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Adicionar ${variant.label}`}
                      disabled={busy}
                      onClick={() =>
                        setCounts((prev) => ({
                          ...prev,
                          [variant.variantKey]: count + 1,
                        }))
                      }
                    >
                      +
                    </Button>
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Custo total: <span className="font-mono">{totalCost}</span>
            </p>
          </div>
        ) : (
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            {variants.map((variant) => (
              <Button
                key={variant.variantKey}
                type="button"
                role="radio"
                aria-checked={selected === variant.variantKey}
                data-cy={`spirit-variant-${variant.variantKey}`}
                variant={selected === variant.variantKey ? "default" : "outline"}
                disabled={busy}
                onClick={() => setSelected(variant.variantKey)}
              >
                {variant.label}
              </Button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            data-cy="spirit-variant-confirm"
            disabled={busy || !canConfirm}
            onClick={confirm}
          >
            Conjurar
          </Button>
        </DialogFooter>
    </>
  );
}
