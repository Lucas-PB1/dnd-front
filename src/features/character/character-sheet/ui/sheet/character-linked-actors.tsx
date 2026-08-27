"use client";

import Link from "next/link";
import { TruckIcon } from "@heroicons/react/24/outline";

import {
  ACTOR_KIND_LABELS,
  type ActorSummary,
} from "@/entities/actor/types";
import { useCharacterActors } from "@/features/actor/api/use-actors";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";

type CharacterLinkedActorsProps = {
  characterId: string;
};

function ActorRow({ actor }: { actor: ActorSummary }) {
  const hp =
    actor.hitPointsCurrent != null && actor.hitPointsMax != null
      ? `${actor.hitPointsCurrent}/${actor.hitPointsMax} PV`
      : null;

  return (
    <li>
      <Link
        href={`/actors/${actor.id}`}
        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
      >
        <span className="min-w-0 truncate font-medium">{actor.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {ACTOR_KIND_LABELS[actor.actorKind]}
          {hp ? ` · ${hp}` : actor.armorClass != null ? ` · CA ${actor.armorClass}` : ""}
        </span>
      </Link>
    </li>
  );
}

export function CharacterLinkedActors({ characterId }: CharacterLinkedActorsProps) {
  const actors = useCharacterActors(characterId);

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

  return (
    <BeyondPanel title="Navios & companheiros" icon={TruckIcon}>
      <ul className="space-y-0.5">
        {actors.data.map((actor) => (
          <ActorRow key={actor.id} actor={actor} />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Adicione criaturas ou veículos pelo{" "}
        <Link href="/compendium" className="text-primary underline-offset-2 hover:underline">
          compêndio
        </Link>
        .
      </p>
    </BeyondPanel>
  );
}
