"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { useCharacters } from "@/features/characters/api/use-characters";
import { useCampaign } from "@/features/campaigns/api/use-campaigns";
import type { AdvantageMode } from "@/features/campaigns/api/encounters.api";
import {
  useActiveEncounter,
  useCreateEncounter,
  usePatchEncounterCombatant,
  useRemoveEncounterCombatant,
  useRollCombatantInitiative,
} from "@/features/campaigns/api/use-encounters";
import { EncounterCombatantRow } from "@/features/campaigns/ui/encounter-combatant-row";
import { EncounterDmControls } from "@/features/campaigns/ui/encounter-dm-controls";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function EncounterView({ campaignId }: { campaignId: string }) {
  const campaign = useCampaign(campaignId);
  const active = useActiveEncounter(campaignId);
  const create = useCreateEncounter(campaignId);
  const rollOne = useRollCombatantInitiative(campaignId);
  const patchCombatant = usePatchEncounterCombatant(campaignId);
  const removeCombatant = useRemoveEncounterCombatant(campaignId);
  const { data: myCharacters } = useCharacters();

  const [name, setName] = useState("Combate");
  const [advantage, setAdvantage] = useState<AdvantageMode>("normal");

  const myCharacterIds = useMemo(
    () => new Set((myCharacters ?? []).map((c) => c.id)),
    [myCharacters],
  );

  const role = campaign.data?.myRole;
  const canManage = role === "dm" || role === "assistant";
  const encounter = active.data ?? null;

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    create.mutate(name.trim());
  }

  if (campaign.isPending || active.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando encontro…</p>;
  }

  if (campaign.isError || !campaign.data) {
    return (
      <p className="text-sm text-destructive">
        {campaign.error instanceof Error
          ? campaign.error.message
          : "Campanha não encontrada"}
      </p>
    );
  }

  if (active.isError) {
    const forbidden =
      active.error instanceof ApiError && active.error.isForbidden;
    return (
      <div className="space-y-3">
        <Header
          campaignId={campaignId}
          campaignName={campaign.data.name}
        />
        <p className="text-sm text-muted-foreground">
          {forbidden
            ? "O mestre ainda não compartilhou o encontro com os jogadores."
            : active.error instanceof Error
              ? active.error.message
              : "Não foi possível carregar o encontro."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header campaignId={campaignId} campaignName={campaign.data.name} />

      {!encounter ? (
        <div className="space-y-4 rounded-xl border border-dashed border-border p-6">
          <p className="text-sm text-muted-foreground">
            Nenhum encontro ativo nesta campanha.
          </p>
          {canManage ? (
            <form onSubmit={onCreate} className="flex flex-wrap gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="Nome do encontro"
                className="max-w-xs"
                required
              />
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Iniciando…" : "Iniciar encontro"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aguarde o mestre iniciar um combate.
            </p>
          )}
          {create.isError ? (
            <p className="text-sm text-destructive">
              {create.error instanceof Error
                ? create.error.message
                : "Falha ao criar encontro"}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                {encounter.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Rodada {encounter.round}
                {encounter.playersCanView
                  ? " · Visível aos jogadores"
                  : " · Só mestre"}
              </p>
            </div>
            {!canManage ? (
              <label className="flex items-center gap-2 text-sm">
                Iniciativa
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  value={advantage}
                  onChange={(e) =>
                    setAdvantage(e.target.value as AdvantageMode)
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="advantage">Vantagem</option>
                  <option value="disadvantage">Desvantagem</option>
                </select>
              </label>
            ) : null}
          </div>

          {canManage ? (
            <EncounterDmControls
              campaignId={campaignId}
              encounter={encounter}
              advantage={advantage}
              onAdvantageChange={setAdvantage}
            />
          ) : null}

          <ul className="overflow-hidden rounded-xl border border-border">
            {encounter.combatants.map((combatant) => {
              const isMine =
                combatant.kind === "pc" &&
                !!combatant.characterId &&
                myCharacterIds.has(combatant.characterId);
              const canRoll = canManage || isMine;
              return (
                <EncounterCombatantRow
                  key={combatant.id}
                  combatant={combatant}
                  canManage={canManage}
                  canRoll={canRoll}
                  advantage={advantage}
                  busy={
                    rollOne.isPending ||
                    patchCombatant.isPending ||
                    removeCombatant.isPending
                  }
                  onRoll={() =>
                    rollOne.mutate({
                      encounterId: encounter.id,
                      combatantId: combatant.id,
                      advantage:
                        advantage === "normal" ? undefined : advantage,
                    })
                  }
                  onHpSet={
                    canManage && combatant.kind === "creature"
                      ? (hpCurrent) =>
                          patchCombatant.mutate({
                            encounterId: encounter.id,
                            combatantId: combatant.id,
                            payload: { hpCurrent },
                          })
                      : undefined
                  }
                  onRemove={
                    canManage
                      ? () =>
                          removeCombatant.mutate({
                            encounterId: encounter.id,
                            combatantId: combatant.id,
                          })
                      : undefined
                  }
                />
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Header({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{campaignName}</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Encontro
        </h1>
      </div>
      <Link
        href={`/campaigns/${campaignId}`}
        className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
      >
        Voltar à campanha
      </Link>
    </div>
  );
}
