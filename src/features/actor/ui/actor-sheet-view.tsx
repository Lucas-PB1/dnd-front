"use client";

import Link from "next/link";

import {
  ACTOR_KIND_LABELS,
  type ActorDetail,
} from "@/entities/actor/types";
import { useActorDetail } from "@/features/actor/api/use-actors";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import { TemplateSpellsList } from "@/features/catalog/template-stat-block/ui/template-stat-block-sections";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type ActorSheetViewProps = {
  id: string;
};

function ActorSheetContent({ actor }: { actor: ActorDetail }) {
  const isVehicle = actor.actorKind === "vehicle";

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-border pb-4">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {ACTOR_KIND_LABELS[actor.actorKind]}
          {actor.templateSlug ? ` · ${actor.templateSlug}` : ""}
        </p>
        {actor.parentCharacterId ? (
          <Link
            href={`/characters/${actor.parentCharacterId}`}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver personagem vinculado
          </Link>
        ) : null}
      </header>

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

      {actor.notes ? (
        <p className="text-sm text-muted-foreground">{actor.notes}</p>
      ) : null}

      <TemplateSpellsList
        spells={actor.spells.map((spell) => ({
          spellSlug: spell.spellSlug,
          usageKind: spell.usageKind,
          usesPerDay: spell.usesPerDay ?? null,
          slotLevel: spell.slotLevel ?? null,
          rechargeDice: spell.rechargeDice ?? null,
        }))}
      />
    </div>
  );
}

export function ActorSheetView({ id }: ActorSheetViewProps) {
  const query = useActorDetail(id);

  return (
    <AppPageShell width="sheet" className="min-h-dvh">
      {query.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando ficha…</p>
      ) : query.isError || !query.data ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">Ficha não encontrada.</p>
          <Link
            href="/characters"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Meus personagens
          </Link>
        </div>
      ) : (
        <ActorSheetContent actor={query.data} />
      )}
    </AppPageShell>
  );
}
