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
import {
  artisanCraftItemLabel,
  type ArtisanCraftOption,
} from "@/features/character/character-sheet/lib/combat/artisan-quick-craft";

type ArtisanCraftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: readonly ArtisanCraftOption[];
  busy?: boolean;
  onPick: (itemSlug: string) => void;
};

/** Escolha de item da tabela Fabricação Rápida antes do table-action. */
export function ArtisanCraftDialog({
  open,
  onOpenChange,
  options,
  busy,
  onPick,
}: ArtisanCraftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fabricação Rápida</DialogTitle>
          <DialogDescription>
            Escolha um item da tabela (dura até o próximo Descanso Longo).
          </DialogDescription>
        </DialogHeader>
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma ferramenta de artesão escolhida na ficha (artisanTool1–3).
          </p>
        ) : (
          <ul className="grid max-h-72 gap-1.5 overflow-y-auto">
            {options.map((option) => (
              <li key={option.itemSlug}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start px-3 py-2 text-left"
                  disabled={busy}
                  onClick={() => onPick(option.itemSlug)}
                >
                  <span className="font-medium">
                    {artisanCraftItemLabel(option.itemSlug)}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {option.toolSlug.replace(/^ferramentas-de-/, "")}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
