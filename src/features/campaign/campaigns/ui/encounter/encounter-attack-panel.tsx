"use client";

import { useMemo, useState } from "react";

import type {
  AdvantageMode,
  CampaignEncounter,
  EncounterAttackResult,
  EncounterCombatant,
} from "@/features/campaign/campaigns/api/encounters.api";
import { useResolveEncounterAttack } from "@/features/campaign/campaigns/api/use-encounters";
import {
  encounterAttackDamageLine,
  encounterAttackHeadline,
} from "@/features/campaign/campaigns/lib/encounter-attack-outcome";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type Props = {
  campaignId: string;
  encounter: CampaignEncounter;
  advantage: AdvantageMode;
  eligibleAttackers: EncounterCombatant[];
};

export function EncounterAttackPanel({
  campaignId,
  encounter,
  advantage,
  eligibleAttackers,
}: Props) {
  const attack = useResolveEncounterAttack(campaignId);
  const attackerIds = useMemo(
    () => new Set(eligibleAttackers.map((row) => row.id)),
    [eligibleAttackers],
  );

  const defaultAttacker =
    (encounter.currentCombatantId &&
    attackerIds.has(encounter.currentCombatantId)
      ? encounter.currentCombatantId
      : eligibleAttackers[0]?.id) ?? "";

  const [attackerId, setAttackerId] = useState(defaultAttacker);
  const [targetId, setTargetId] = useState(
    encounter.combatants.find((row) => row.id !== defaultAttacker)?.id ?? "",
  );
  const [last, setLast] = useState<EncounterAttackResult | null>(null);

  const attackerOptions = eligibleAttackers.map((row) => ({
    value: row.id,
    label: row.displayName,
  }));
  const targetOptions = encounter.combatants
    .filter((row) => row.id !== attackerId)
    .map((row) => ({
      value: row.id,
      label: row.displayName,
    }));

  const canSubmit =
    Boolean(attackerId) && Boolean(targetId) && !attack.isPending;

  if (eligibleAttackers.length === 0 || encounter.combatants.length < 2) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/45 p-3 sm:p-4">
      <p className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-secondary uppercase">
        Ataque
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Atacante</span>
          <SearchableSelect
            className="h-9 w-full text-sm"
            value={attackerId}
            options={attackerOptions}
            onValueChange={(next) => {
              setAttackerId(next);
              if (next === targetId) {
                setTargetId(
                  encounter.combatants.find((row) => row.id !== next)?.id ??
                    "",
                );
              }
            }}
          />
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Alvo</span>
          <SearchableSelect
            className="h-9 w-full text-sm"
            value={targetId}
            options={targetOptions}
            onValueChange={setTargetId}
          />
        </label>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            attack.mutate(
              {
                encounterId: encounter.id,
                payload: {
                  attackerCombatantId: attackerId,
                  targetCombatantId: targetId,
                  advantage: advantage === "normal" ? undefined : advantage,
                },
              },
              { onSuccess: (result) => setLast(result) },
            );
          }}
        >
          {attack.isPending ? "Resolvendo…" : "Atacar"}
        </Button>
      </div>
      {last ? (
        <div className="space-y-0.5 text-sm">
          <p className="font-medium">{encounterAttackHeadline(last)}</p>
          {encounterAttackDamageLine(last) ? (
            <p className="text-muted-foreground">
              {encounterAttackDamageLine(last)}
            </p>
          ) : null}
          {last.note ? (
            <p className="text-muted-foreground">{last.note}</p>
          ) : null}
        </div>
      ) : null}
      {attack.isError ? (
        <p className="text-sm text-destructive">
          {attack.error instanceof Error
            ? attack.error.message
            : "Falha ao resolver o ataque"}
        </p>
      ) : null}
    </div>
  );
}
