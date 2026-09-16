"use client";

import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { MissileCastBoostSnapshot } from "@/features/character/character-sheet/lib/combat/magic-missile-cast-boosts";

type MagicMissileBoostDialogProps = {
  open: boolean;
  snapshot: MissileCastBoostSnapshot;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (choice: { applyShield: boolean; applyGiga: boolean }) => void;
};

export function MagicMissileBoostDialog({
  open,
  snapshot,
  busy,
  onOpenChange,
  onConfirm,
}: MagicMissileBoostDialogProps) {
  const [applyShield, setApplyShield] = useState(snapshot.shieldArmed);
  const [applyGiga, setApplyGiga] = useState(snapshot.gigaArmed);

  useEffect(() => {
    if (!open) return;
    setApplyShield(snapshot.shieldArmed);
    setApplyGiga(snapshot.gigaArmed);
  }, [open, snapshot.gigaArmed, snapshot.shieldArmed]);

  const showShield = snapshot.shieldArmed || snapshot.shieldRemaining > 0;
  const showGiga = snapshot.gigaArmed || snapshot.gigaRemaining > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-cy="magic-missile-boost-dialog">
        <DialogHeader>
          <DialogTitle>Mísseis Mágicos</DialogTitle>
          <DialogDescription>
            Aplicar Escudo de Mísseis e/ou Giga-Míssil neste lançamento. Recursos
            já armados na Economia entram automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {showShield ? (
            <BoostCheckbox
              id="apply-missile-shield"
              label="Escudo de Mísseis"
              remaining={snapshot.shieldRemaining}
              armed={snapshot.shieldArmed}
              checked={snapshot.shieldArmed || applyShield}
              disabled={busy || snapshot.shieldArmed}
              onCheckedChange={setApplyShield}
            />
          ) : null}
          {showGiga ? (
            <BoostCheckbox
              id="apply-giga-missile"
              label="Giga-Míssil"
              remaining={snapshot.gigaRemaining}
              armed={snapshot.gigaArmed}
              checked={snapshot.gigaArmed || applyGiga}
              disabled={busy || snapshot.gigaArmed}
              onCheckedChange={setApplyGiga}
            />
          ) : null}
        </div>
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
            data-cy="magic-missile-boost-confirm"
            disabled={busy}
            onClick={() =>
              onConfirm({
                applyShield: snapshot.shieldArmed || applyShield,
                applyGiga: snapshot.gigaArmed || applyGiga,
              })
            }
          >
            Conjurar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BoostCheckbox({
  id,
  label,
  remaining,
  armed,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  remaining: number;
  armed: boolean;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2 text-sm text-foreground"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">
          {armed
            ? "Já armado na Economia — aplica neste lançamento"
            : `${remaining} uso(s) restante(s)`}
        </span>
      </span>
    </label>
  );
}
