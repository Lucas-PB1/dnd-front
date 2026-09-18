"use client";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type ItemCastConcentrationDialogProps = {
  open: boolean;
  currentSpellLabel: string;
  nextSpellLabel: string;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ItemCastConcentrationDialog({
  open,
  currentSpellLabel,
  nextSpellLabel,
  busy,
  onOpenChange,
  onConfirm,
}: ItemCastConcentrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-cy="item-cast-concentration-dialog"
      >
        <DialogHeader>
          <DialogTitle>Trocar concentração?</DialogTitle>
          <DialogDescription>
            Você está concentrado em{" "}
            <span className="font-medium text-foreground">
              {currentSpellLabel}
            </span>
            . Conjurar{" "}
            <span className="font-medium text-foreground">{nextSpellLabel}</span>{" "}
            pelo item encerra essa concentração.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            data-cy="item-cast-concentration-confirm"
            disabled={busy}
            onClick={onConfirm}
          >
            Conjurar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
