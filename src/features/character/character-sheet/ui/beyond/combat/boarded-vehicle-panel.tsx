"use client";

import Link from "next/link";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import {
  ACTOR_KIND_LABELS,
  type ActorDetail,
} from "@/entities/actor/types";
import {
  useActorDetail,
  useBoardVehicle,
  useUpdateActor,
} from "@/features/actor/api/use-actors";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import {
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";

type BoardedVehiclePanelProps = {
  characterId: string;
  actorId: string;
};

function VehicleHpStepper({ actor }: { actor: ActorDetail }) {
  const update = useUpdateActor(actor.id);
  const current = actor.hitPointsCurrent ?? actor.hitPointsMax ?? 0;
  const max = actor.hitPointsMax;

  function setHp(next: number) {
    const clamped =
      max != null ? Math.max(0, Math.min(max, next)) : Math.max(0, next);
    update.mutate({ hitPointsCurrent: clamped });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase">
        PV
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        disabled={update.isPending || current <= 0}
        onClick={() => setHp(current - 1)}
        aria-label="Reduzir PV"
      >
        <MinusIcon className="size-3.5" />
      </Button>
      <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums">
        {current}
        {max != null ? ` / ${max}` : ""}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        disabled={update.isPending || (max != null && current >= max)}
        onClick={() => setHp(current + 1)}
        aria-label="Aumentar PV"
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
}

export function BoardedVehiclePanel({
  characterId,
  actorId,
}: BoardedVehiclePanelProps) {
  const actorQuery = useActorDetail(actorId);
  const board = useBoardVehicle(characterId);

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
          disabled={board.isPending}
          onClick={() => board.mutate(null)}
        >
          Sair
        </Button>
      </section>
    );
  }

  const actor = actorQuery.data;
  const isVehicle = actor.actorKind === "vehicle";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SheetSectionHeader title="A bordo" />
        <div className="flex flex-wrap items-center gap-2">
          <VehicleHpStepper actor={actor} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={board.isPending}
            onClick={() => board.mutate(null)}
          >
            Sair
          </Button>
          <Link
            href={`/actors/${actor.id}`}
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Abrir ficha
          </Link>
        </div>
      </div>
      <SheetSubheader
        title={`${actor.name} · ${ACTOR_KIND_LABELS[actor.actorKind]}`}
      />
      <StatBlockCard
        variant={isVehicle ? "vehicle" : "creature"}
        name={actor.name}
        armorClass={actor.armorClass}
        initiativeModifier={actor.initiativeModifier}
        hitPoints={actor.hitPointsMax}
        hitPointsCurrent={actor.hitPointsCurrent}
        damageThreshold={actor.damageThreshold}
        speeds={actor.speeds}
        abilityScores={actor.abilityScores}
        crewCapacity={actor.crewCapacity}
        passengerCapacity={actor.passengerCapacity}
        cargoCapacityLabel={
          actor.cargoCapacityLb != null ? `${actor.cargoCapacityLb} lb` : null
        }
        proficiencyBonus={actor.proficiencyBonus}
        enableRolls
        actions={actor.actions.map((action, index) => ({
          id: action.id,
          name: action.name,
          actionBucket: action.actionBucket ?? "action",
          attackBonus: action.attackBonus ?? null,
          damageExpression: action.damageExpression ?? null,
          reachFt: action.reachFt ?? null,
          description: action.description ?? null,
          sortOrder: action.sortOrder ?? index,
        }))}
      />
    </section>
  );
}
