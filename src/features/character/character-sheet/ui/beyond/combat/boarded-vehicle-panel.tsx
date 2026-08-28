"use client";

import { useState } from "react";

import {
  ACTOR_KIND_LABELS,
  type ActorDetail,
} from "@/entities/actor/types";
import {
  useActorDetail,
  useBoardVehicle,
  usePatchActorState,
} from "@/features/actor/api/use-actors";
import { ActorSheetDialog } from "@/features/actor/ui/actor-sheet-dialog";
import { VitalStepper } from "@/features/actor/ui/vital-stepper";
import {
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";

type BoardedVehiclePanelProps = {
  characterId: string;
  actorId: string;
};

function BoardedVehicleHp({ actor }: { actor: ActorDetail }) {
  const patch = usePatchActorState(actor.id);
  const current = actor.hitPointsCurrent ?? actor.hitPointsMax ?? 0;
  const max = actor.hitPointsMax;

  return (
    <VitalStepper
      id={`boarded-hp-${actor.id}`}
      label="PV"
      value={current}
      max={max}
      disabled={patch.isPending}
      onChange={(next) => patch.mutate({ hitPointsCurrent: next })}
    />
  );
}

export function BoardedVehiclePanel({
  characterId,
  actorId,
}: BoardedVehiclePanelProps) {
  const actorQuery = useActorDetail(actorId);
  const board = useBoardVehicle(characterId);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (actorQuery.isPending) {
    return (
      <section className="space-y-2">
        <SheetSectionHeader title="A bordo" />
        <p className="text-sm text-muted-foreground">Carregando veículo…</p>
      </section>
    );
  }

  if (actorQuery.isError || !actorQuery.data) {
    return (
      <section className="space-y-2">
        <SheetSectionHeader title="A bordo" />
        <p className="text-sm text-destructive">
          Não foi possível carregar o veículo vinculado.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 touch-manipulation sm:min-h-8"
          disabled={board.isPending}
          onClick={() => board.mutate(null)}
        >
          Sair
        </Button>
      </section>
    );
  }

  const actor = actorQuery.data;

  return (
    <section className="space-y-3">
      <SheetSectionHeader title="A bordo" />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <BoardedVehicleHp actor={actor} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-11 flex-1 touch-manipulation sm:min-h-8 sm:flex-none"
            onClick={() => setSheetOpen(true)}
          >
            Abrir ficha
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 flex-1 touch-manipulation sm:min-h-8 sm:flex-none"
            disabled={board.isPending}
            onClick={() => board.mutate(null)}
          >
            Sair
          </Button>
        </div>
      </div>
      <button
        type="button"
        className="block w-full rounded-md border border-border/60 bg-muted/20 px-3 py-3 text-left touch-manipulation active:bg-muted/40"
        onClick={() => setSheetOpen(true)}
      >
        <SheetSubheader
          title={`${actor.name} · ${ACTOR_KIND_LABELS[actor.actorKind]}`}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Toque para abrir a ficha completa (PV, ações e estado).
        </p>
      </button>
      <ActorSheetDialog
        actorId={actorId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </section>
  );
}
