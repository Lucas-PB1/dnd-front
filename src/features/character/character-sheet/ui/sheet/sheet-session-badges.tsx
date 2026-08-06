"use client";

import {
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

import {
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character/character-sheet/api/use-character-state";
import { DeathSaveTrack } from "@/features/character/character-sheet/ui/beyond/combat/death-save-track";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type SheetSessionBadgesProps = {
  characterId: string;
};

/** Inspiração (ícone) + testes de morte (modal) no topo da ficha. */
export function SheetSessionBadges({ characterId }: SheetSessionBadgesProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const [deathOpen, setDeathOpen] = useState(false);

  const state = stateQuery.data;
  const inspired = state?.inspiration ?? false;
  const successes = state?.deathSaveSuccesses ?? 0;
  const failures = state?.deathSaveFailures ?? 0;
  const busy = !state || patchState.isPending;
  const hasDeathMarks = successes > 0 || failures > 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={busy}
        aria-pressed={inspired}
        aria-label={inspired ? "Remover inspiração" : "Marcar inspiração"}
        title={inspired ? "Inspiração ativa — clique para remover" : "Marcar inspiração"}
        onClick={() => patchState.mutate({ inspiration: !inspired })}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:opacity-50",
          inspired
            ? "border-secondary/50 bg-secondary/20 text-secondary shadow-sm"
            : "border-border/70 bg-card/60 text-muted-foreground hover:border-secondary/40 hover:text-secondary",
        )}
      >
        {inspired ? (
          <SparklesSolid className="size-4" aria-hidden />
        ) : (
          <SparklesIcon className="size-4" aria-hidden />
        )}
      </button>

      <Button
        type="button"
        size="sm"
        variant={hasDeathMarks ? "outline" : "ghost"}
        disabled={!state}
        className={cn(
          "h-9 gap-1.5 px-2.5",
          hasDeathMarks && "border-destructive/40 text-destructive",
        )}
        onClick={() => setDeathOpen(true)}
        title="Testes de morte"
      >
        <HeartIcon className="size-3.5 shrink-0" aria-hidden />
        <span className="text-xs font-semibold">Morte</span>
        {hasDeathMarks ? (
          <span className="font-mono text-[0.65rem] tabular-nums opacity-90">
            {successes}✓ · {failures}✗
          </span>
        ) : null}
      </Button>

      <Dialog open={deathOpen} onOpenChange={setDeathOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Testes de morte</DialogTitle>
            <DialogDescription>
              Marque sucessos e falhas enquanto estiver a 0 PV.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            <DeathSaveTrack
              label="Sucessos"
              value={successes}
              disabled={busy}
              onChange={(deathSaveSuccesses) =>
                patchState.mutate({ deathSaveSuccesses })
              }
            />
            <DeathSaveTrack
              label="Falhas"
              value={failures}
              tone="danger"
              disabled={busy}
              onChange={(deathSaveFailures) =>
                patchState.mutate({ deathSaveFailures })
              }
            />
          </div>
          {hasDeathMarks ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={() =>
                patchState.mutate({
                  deathSaveSuccesses: 0,
                  deathSaveFailures: 0,
                })
              }
            >
              Zerar testes
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
