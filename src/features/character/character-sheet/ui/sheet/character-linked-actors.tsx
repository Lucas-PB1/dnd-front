"use client";

import Link from "next/link";
import { TruckIcon } from "@heroicons/react/24/outline";

import {
  ACTOR_KIND_LABELS,
  type ActorSummary,
} from "@/entities/actor/types";
import {
  useBoardVehicle,
  useCharacterActors,
} from "@/features/actor/api/use-actors";
import { useCharacterState } from "@/features/character/character-sheet/api/use-character-state";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CharacterLinkedActorsProps = {
  characterId: string;
};

function isBoardableActor(actor: ActorSummary): boolean {
  return actor.actorKind === "vehicle" || actor.actorKind === "mount";
}

function ActorRow({
  actor,
  boardedActorId,
  onBoard,
  onLeave,
  isPending,
}: {
  actor: ActorSummary;
  boardedActorId: string | null;
  onBoard: (actorId: string) => void;
  onLeave: () => void;
  isPending: boolean;
}) {
  const hp =
    actor.hitPointsCurrent != null && actor.hitPointsMax != null
      ? `${actor.hitPointsCurrent}/${actor.hitPointsMax} PV`
      : null;
  const boarded = boardedActorId === actor.id;
  const boardable = isBoardableActor(actor);

  return (
    <li
      className={cn(
        "rounded-md px-2 py-1.5",
        boarded && "bg-sky-500/10 ring-1 ring-sky-500/30",
        actor.actorKind === "vehicle" && !boarded && "bg-muted/20",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/actors/${actor.id}`}
          className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
        >
          {actor.name}
        </Link>
        <span className="shrink-0 text-xs text-muted-foreground">
          {ACTOR_KIND_LABELS[actor.actorKind]}
          {hp ? ` · ${hp}` : actor.armorClass != null ? ` · CA ${actor.armorClass}` : ""}
        </span>
      </div>
      {boardable ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {boarded ? (
            <>
              <span className="rounded bg-sky-600/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sky-800 uppercase dark:text-sky-200">
                A bordo
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={isPending}
                onClick={onLeave}
              >
                Sair
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isPending}
              onClick={() => onBoard(actor.id)}
            >
              Entrar
            </Button>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function CharacterLinkedActors({ characterId }: CharacterLinkedActorsProps) {
  const actors = useCharacterActors(characterId);
  const state = useCharacterState(characterId);
  const board = useBoardVehicle(characterId);
  const boardedActorId = state.data?.boardedActorId ?? null;

  if (actors.isPending) {
    return (
      <BeyondPanel title="Navios & companheiros" icon={TruckIcon}>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </BeyondPanel>
    );
  }

  if (actors.isError || !actors.data?.length) {
    return null;
  }

  const sorted = [...actors.data].sort((a, b) => {
    const aBoard = isBoardableActor(a) ? 0 : 1;
    const bBoard = isBoardableActor(b) ? 0 : 1;
    if (aBoard !== bBoard) return aBoard - bBoard;
    return a.name.localeCompare(b.name, "pt");
  });

  return (
    <BeyondPanel title="Navios & companheiros" icon={TruckIcon}>
      <ul className="space-y-1">
        {sorted.map((actor) => (
          <ActorRow
            key={actor.id}
            actor={actor}
            boardedActorId={boardedActorId}
            isPending={board.isPending}
            onBoard={(id) => board.mutate(id)}
            onLeave={() => board.mutate(null)}
          />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Adicione criaturas ou veículos pelo{" "}
        <Link href="/compendium" className="text-primary underline-offset-2 hover:underline">
          compêndio
        </Link>
        , ou vincule um item de transporte no inventário.
      </p>
    </BeyondPanel>
  );
}
