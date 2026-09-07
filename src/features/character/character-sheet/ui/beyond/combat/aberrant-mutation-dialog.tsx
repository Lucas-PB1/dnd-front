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
  ABERRANT_MUTATION_SLUGS,
  aberrantMutationLabel,
  aberrantMutationNote,
  isAberrantMutationSlug,
  type AberrantMutationSlug,
} from "@/features/character/character-sheet/lib/transformation/aberrant-mutation";

type AberrantMutationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSlug: string | null | undefined;
  busy?: boolean;
  onActivate: (mutationSlug: AberrantMutationSlug) => void;
  onEnd: () => void;
};

/** Escolha de Mutação Aberrante antes do transformation table-action. */
export function AberrantMutationDialog({
  open,
  onOpenChange,
  activeSlug,
  busy,
  onActivate,
  onEnd,
}: AberrantMutationDialogProps) {
  const activeLabel = isAberrantMutationSlug(activeSlug)
    ? aberrantMutationLabel(activeSlug)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mutação Aberrante</DialogTitle>
          <DialogDescription>
            {activeLabel
              ? `Ativa: ${activeLabel}. Escolha outra mutação (gasta uso) ou encerre.`
              : "Escolha uma mutação (1 min — declare na mesa)."}
          </DialogDescription>
        </DialogHeader>
        <ul className="grid max-h-72 gap-1.5 overflow-y-auto">
          {ABERRANT_MUTATION_SLUGS.map((slug) => {
            const isActive = activeSlug === slug;
            return (
              <li key={slug}>
                <Button
                  type="button"
                  variant={isActive ? "secondary" : "outline"}
                  className="h-auto w-full flex-col items-start gap-0.5 px-3 py-2 text-left"
                  disabled={busy || isActive}
                  onClick={() => onActivate(slug)}
                >
                  <span className="font-medium">
                    {aberrantMutationLabel(slug)}
                    {isActive ? " (ativa)" : ""}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {aberrantMutationNote(slug)}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {activeSlug ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={onEnd}
            >
              Encerrar
            </Button>
          ) : null}
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
