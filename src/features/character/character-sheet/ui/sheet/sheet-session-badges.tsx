"use client";

import {
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolid } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";

import {
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character/character-sheet/api/use-character-state";
import { useTransferInspiration } from "@/features/character/character-sheet/api/use-transfer-inspiration";
import { useCharacters } from "@/features/character/characters/api/use-characters";
import { DeathSaveTrack } from "@/features/character/character-sheet/ui/beyond/combat/status/death-save-track";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

const MESA_CIRCUMSTANCES = [
  { tag: "snow_ice", label: "Neve/gelo" },
  { tag: "in_water", label: "Na água" },
  { tag: "extreme_cold", label: "Frio extremo" },
] as const;

type SheetSessionBadgesProps = {
  characterId: string;
};

/** Inspiração (ícone) + testes de morte (modal) + circunstâncias de mesa. */
export function SheetSessionBadges({ characterId }: SheetSessionBadgesProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const transferInspiration = useTransferInspiration(characterId);
  const charactersQuery = useCharacters();
  const [deathOpen, setDeathOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferNote, setTransferNote] = useState<string | null>(null);

  const state = stateQuery.data;
  const inspired = state?.inspiration ?? false;
  const successes = state?.deathSaveSuccesses ?? 0;
  const failures = state?.deathSaveFailures ?? 0;
  const circumstances = state?.mesaCircumstances ?? [];
  const busy = !state || patchState.isPending || transferInspiration.isPending;
  const hasDeathMarks = successes > 0 || failures > 0;

  const allies = useMemo(
    () =>
      (charactersQuery.data ?? []).filter(
        (row) => row.id !== characterId,
      ),
    [charactersQuery.data, characterId],
  );

  function toggleCircumstance(tag: string) {
    const set = new Set(circumstances);
    if (set.has(tag)) set.delete(tag);
    else set.add(tag);
    patchState.mutate({ mesaCircumstances: [...set] });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={busy}
        aria-pressed={inspired}
        aria-label={inspired ? "Remover inspiração" : "Marcar inspiração"}
        title={
          inspired
            ? "Inspiração ativa — clique para remover"
            : "Marcar inspiração"
        }
        onClick={() => patchState.mutate({ inspiration: !inspired })}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:opacity-50",
          inspired
            ? "border-secondary/50 bg-secondary/20 text-secondary shadow-sm"
            : "border-border/70 bg-card/60 text-muted-foreground hover:border-secondary/40 hover:text-secondary",
        )}
      >
        {inspired ? (
          <SparklesSolid className="size-3.5" aria-hidden />
        ) : (
          <SparklesIcon className="size-3.5" aria-hidden />
        )}
      </button>

      {inspired ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          disabled={busy || allies.length === 0}
          title={
            allies.length === 0
              ? "Sem outros personagens para transferir"
              : "Transferir inspiração para aliado"
          }
          onClick={() => {
            setTransferNote(null);
            setTransferOpen(true);
          }}
        >
          Transferir
        </Button>
      ) : null}

      {MESA_CIRCUMSTANCES.map(({ tag, label }) => {
        const on = circumstances.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            disabled={busy}
            aria-pressed={on}
            title={label}
            onClick={() => toggleCircumstance(tag)}
            className={cn(
              "h-8 rounded-full border px-2 text-[0.65rem] font-semibold transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              "disabled:opacity-50",
              on
                ? "border-chart-3/50 bg-chart-3/20 text-chart-3"
                : "border-border/70 bg-card/60 text-muted-foreground hover:border-chart-3/40",
            )}
          >
            {label}
          </button>
        );
      })}

      <Button
        type="button"
        size="sm"
        variant={hasDeathMarks ? "outline" : "ghost"}
        disabled={!state}
        className={cn(
          "h-8 gap-1 px-2",
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
              Limpar
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Transferir inspiração</DialogTitle>
            <DialogDescription>
              Passa a Inspiração Heroica para outro personagem seu (ou da
              campanha, se a API permitir write).
            </DialogDescription>
          </DialogHeader>
          <ul className="grid max-h-64 gap-1.5 overflow-y-auto">
            {allies.map((ally) => (
              <li key={ally.id}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start px-3 py-2"
                  disabled={busy}
                  onClick={() =>
                    transferInspiration.mutate(ally.id, {
                      onSuccess: (result) => {
                        setTransferNote(result.note);
                        setTransferOpen(false);
                      },
                    })
                  }
                >
                  {ally.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    Nv. {ally.level}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
          {transferNote ? (
            <p className="text-sm text-secondary" role="status">
              {transferNote}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransferOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
