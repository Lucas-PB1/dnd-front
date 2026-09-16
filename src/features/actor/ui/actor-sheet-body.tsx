"use client";

import { useState } from "react";

import {
  ACTOR_KIND_LABELS,
  type ActorAttackRollResult,
  type ActorDetail,
} from "@/entities/actor/types";
import { resolveActorVitals } from "@/entities/actor/lib/resolve-actor-vitals";
import {
  useActorState,
  usePatchActorState,
  useRollActorAttack,
} from "@/features/actor/api/use-actors";
import { VitalStepper } from "@/features/actor/ui/vital-stepper";
import { MountSheetControls } from "@/features/actor/ui/mount-sheet-controls";
import { VehicleSheetControls } from "@/features/actor/ui/vehicle-sheet-controls";
import { useCharacterState } from "@/features/character/character-sheet/api/use-character-state";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import { TemplateSpellsList } from "@/features/catalog/template-stat-block/ui/template-stat-block-sections";
import { formatKgFromPounds } from "@/shared/lib/metric";
import { Button } from "@/shared/ui/button";

type ActorSheetBodyProps = {
  actor: ActorDetail;
  hideParentLink?: boolean;
};

export function ActorSheetBody({
  actor,
  hideParentLink = false,
}: ActorSheetBodyProps) {
  const liveQuery = useActorState(actor.id);
  const patchState = usePatchActorState(actor.id);
  const attackRoll = useRollActorAttack(actor.id);
  const [latestAttack, setLatestAttack] =
    useState<ActorAttackRollResult | null>(null);
  const vitals = resolveActorVitals(actor, liveQuery.data);
  const isVehicle = actor.actorKind === "vehicle";
  const isMount = actor.actorKind === "mount";
  const sheetCharacterId =
    isVehicle || isMount ? actor.parentCharacterId : null;
  const sessionQuery = useCharacterState(sheetCharacterId ?? "");
  const boarded =
    Boolean(sheetCharacterId) &&
    sessionQuery.data?.boardedActorId === actor.id;

  function setHp(next: number) {
    const max = vitals.hitPointsMax;
    const clamped =
      max != null ? Math.max(0, Math.min(max, next)) : Math.max(0, next);
    patchState.mutate({ hitPointsCurrent: clamped });
  }

  function setTempHp(next: number) {
    patchState.mutate({ tempHp: Math.max(0, next) });
  }

  const cargoCapacityLb =
    liveQuery.data?.cargoCapacityLb ?? actor.cargoCapacityLb;

  return (
    <div className="space-y-4">
      <header className="space-y-2 border-b border-border pb-3">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {ACTOR_KIND_LABELS[actor.actorKind]}
          {actor.templateSlug ? ` · ${actor.templateSlug}` : ""}
        </p>
        {!hideParentLink && actor.parentCharacterId ? (
          <p className="text-sm text-muted-foreground">
            Vinculado ao personagem
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <VitalStepper
            id={`actor-hp-${actor.id}`}
            label="PV"
            value={vitals.hitPointsCurrent}
            max={vitals.hitPointsMax}
            disabled={patchState.isPending}
            onChange={setHp}
          />
          <VitalStepper
            id={`actor-temp-hp-${actor.id}`}
            label="PV temp."
            value={vitals.tempHp}
            disabled={patchState.isPending}
            onChange={setTempHp}
          />
          {vitals.armorClass != null ? (
            <span className="text-xs text-muted-foreground">
              CA{" "}
              <span className="font-semibold text-foreground">
                {vitals.armorClass}
              </span>
            </span>
          ) : null}
        </div>
        {vitals.conditions.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Condições: {vitals.conditions.join(", ")}
          </p>
        ) : null}
        {liveQuery.isError ? (
          <p className="text-xs text-destructive">
            {(liveQuery.error as Error)?.message ??
              "Falha ao carregar o estado"}
          </p>
        ) : null}
        {patchState.isError ? (
          <p className="text-xs text-destructive">
            {(patchState.error as Error)?.message ?? "Falha ao atualizar"}
          </p>
        ) : null}
        {attackRoll.isError ? (
          <p className="text-xs text-destructive" role="alert">
            {(attackRoll.error as Error)?.message ?? "Falha ao rolar ataque"}
          </p>
        ) : null}
      </header>

      {isVehicle && sheetCharacterId ? (
        <VehicleSheetControls
          characterId={sheetCharacterId}
          actorId={actor.id}
          boarded={boarded}
          live={liveQuery.data}
          crewCapacity={actor.crewCapacity}
          passengerCapacity={actor.passengerCapacity}
          cargoCapacityLb={actor.cargoCapacityLb}
        />
      ) : null}

      {isMount && sheetCharacterId ? (
        <MountSheetControls
          characterId={sheetCharacterId}
          actorId={actor.id}
          templateSlug={actor.templateSlug}
          boarded={boarded}
          live={liveQuery.data}
        />
      ) : null}

      <StatBlockCard
        variant={isVehicle ? "vehicle" : "creature"}
        name={actor.name}
        imageUrl={actor.imageUrl}
        armorClass={vitals.armorClass}
        initiativeModifier={actor.initiativeModifier}
        hitPoints={vitals.hitPointsMax}
        hitPointsCurrent={vitals.hitPointsCurrent}
        damageThreshold={
          liveQuery.data?.damageThreshold ?? actor.damageThreshold
        }
        speeds={actor.speeds}
        abilityScores={actor.abilityScores}
        crewCapacity={liveQuery.data?.crewCapacity ?? actor.crewCapacity}
        passengerCapacity={
          liveQuery.data?.passengerCapacity ?? actor.passengerCapacity
        }
        cargoCapacityLabel={
          cargoCapacityLb != null ? formatKgFromPounds(cargoCapacityLb) : null
        }
        proficiencyBonus={actor.proficiencyBonus}
        enableRolls
        onAttackAction={(action, advantage) => {
          if (typeof action.id !== "string" || action.id.length === 0) return;
          attackRoll.mutate(
            { actionId: action.id, advantage },
            { onSuccess: (result) => setLatestAttack(result) },
          );
        }}
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

      {latestAttack ? (
        <div
          className="rounded-xl border border-primary/40 bg-card p-3 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {latestAttack.actionName}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-primary">
                {latestAttack.total}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {latestAttack.expression}
                {latestAttack.damageExpression
                  ? ` · dano ${latestAttack.damageExpression}`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setLatestAttack(null)}
            >
              Fechar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
