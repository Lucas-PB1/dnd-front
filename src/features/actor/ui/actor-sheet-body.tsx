"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import {
  ACTOR_KIND_LABELS,
  type ActorDetail,
} from "@/entities/actor/types";
import { usePatchActorState } from "@/features/actor/api/use-actors";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import { TemplateSpellsList } from "@/features/catalog/template-stat-block/ui/template-stat-block-sections";
import { Button } from "@/shared/ui/button";

type ActorSheetBodyProps = {
  actor: ActorDetail;
  /** Esconde link “ver personagem” (útil no modal sobre a ficha). */
  hideParentLink?: boolean;
};

function VitalStepper({
  label,
  value,
  min = 0,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number | null;
  disabled?: boolean;
  onChange: (next: number) => void;
}) {
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        disabled={disabled || atMin}
        onClick={() => onChange(value - 1)}
        aria-label={`Reduzir ${label}`}
      >
        <MinusIcon className="size-3.5" />
      </Button>
      <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums">
        {value}
        {max != null ? ` / ${max}` : ""}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        disabled={disabled || atMax}
        onClick={() => onChange(value + 1)}
        aria-label={`Aumentar ${label}`}
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
}

/** Conteúdo da ficha de actor (veículo/montaria/criatura) com controles de mesa. */
export function ActorSheetBody({
  actor,
  hideParentLink = false,
}: ActorSheetBodyProps) {
  const patchState = usePatchActorState(actor.id);
  const isVehicle = actor.actorKind === "vehicle";
  const hpCurrent = actor.hitPointsCurrent ?? actor.hitPointsMax ?? 0;
  const hpMax = actor.hitPointsMax;
  const tempHp = actor.state?.tempHp ?? 0;
  const conditions = actor.state?.conditions ?? [];

  function setHp(next: number) {
    const clamped =
      hpMax != null ? Math.max(0, Math.min(hpMax, next)) : Math.max(0, next);
    patchState.mutate({ hitPointsCurrent: clamped });
  }

  function setTempHp(next: number) {
    patchState.mutate({ tempHp: Math.max(0, next) });
  }

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
        <div className="flex flex-wrap items-center gap-3">
          <VitalStepper
            label="PV"
            value={hpCurrent}
            max={hpMax}
            disabled={patchState.isPending}
            onChange={setHp}
          />
          <VitalStepper
            label="PV temp."
            value={tempHp}
            disabled={patchState.isPending}
            onChange={setTempHp}
          />
          {actor.armorClass != null ? (
            <span className="text-xs text-muted-foreground">
              CA <span className="font-semibold text-foreground">{actor.armorClass}</span>
            </span>
          ) : null}
        </div>
        {conditions.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Condições: {conditions.join(", ")}
          </p>
        ) : null}
        {patchState.isError ? (
          <p className="text-xs text-destructive">
            {(patchState.error as Error)?.message ?? "Falha ao atualizar"}
          </p>
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
