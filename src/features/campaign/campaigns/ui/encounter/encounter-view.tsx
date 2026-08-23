"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BoltIcon } from "@heroicons/react/24/outline";

import { useCharacters } from "@/features/character/characters/api/use-characters";
import { useCampaign } from "@/features/campaign/campaigns/api/use-campaigns";
import type { AdvantageMode } from "@/features/campaign/campaigns/api/encounters.api";
import {
  useActiveEncounter,
  useCreateEncounter,
  usePatchEncounterCombatant,
  useRemoveEncounterCombatant,
  useRollCombatantInitiative,
} from "@/features/campaign/campaigns/api/use-encounters";
import { EncounterCombatantRow } from "@/features/campaign/campaigns/ui/encounter/encounter-combatant-row";
import { EncounterDmControls } from "@/features/campaign/campaigns/ui/encounter/encounter-dm-controls";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import {
  EmptyMapMark,
  InkFlourish,
  MarginCorner,
  SealMark,
} from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

function EncounterLoadingSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-label="Carregando encontro"
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted/40" />
        <div className="mt-3 h-8 w-48 animate-pulse rounded bg-muted/40" />
        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted/35" />
      </div>
      <div className="h-28 animate-pulse rounded-xl border border-border/70 bg-card/40" />
      <div className="overflow-hidden rounded-xl border border-border/70">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
          >
            <div className="size-12 animate-pulse rounded-lg bg-muted/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted/40" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusChip({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs",
        active
          ? "border-secondary/50 bg-secondary/10 font-medium text-foreground"
          : "border-border/80 bg-muted/25 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

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
    return <EncounterLoadingSkeleton />;
  }

  if (campaign.isError || !campaign.data) {
    return (
      <div className="space-y-3">
        <BackLink href="/campaigns">Campanhas</BackLink>
        <p className="text-sm text-destructive">
          {campaign.error instanceof Error
            ? campaign.error.message
            : "Campanha não encontrada"}
        </p>
      </div>
    );
  }

  if (active.isError) {
    const forbidden =
      active.error instanceof ApiError && active.error.isForbidden;
    return (
      <div className={cn("space-y-4", motion.enter)}>
        <EncounterHeader
          campaignId={campaignId}
          campaignName={campaign.data.name}
        />
        <EmptyState
          icon={<EmptyMapMark className="size-14" />}
          title={
            forbidden
              ? "Encontro ainda privado"
              : "Não foi possível carregar"
          }
          description={
            forbidden
              ? "O mestre ainda não compartilhou o encontro com os jogadores."
              : active.error instanceof Error
                ? active.error.message
                : "Tente voltar à campanha e abrir de novo."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 sm:space-y-5", motion.enter)}>
      <EncounterHeader
        campaignId={campaignId}
        campaignName={campaign.data.name}
        encounterName={encounter?.name}
        round={encounter?.round}
        playersCanView={encounter?.playersCanView}
      />

      {!encounter ? (
        <EmptyState
          icon={<EmptyMapMark className="size-14" />}
          title="Nenhum encontro ativo"
          description={
            canManage
              ? "Inicie um combate para montar a ordem de iniciativa da mesa."
              : "Aguarde o mestre iniciar um combate."
          }
          action={
            canManage ? (
              <form
                onSubmit={onCreate}
                className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center"
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  placeholder="Nome do encontro"
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="inline-flex items-center gap-1.5"
                >
                  <BoltIcon className="size-4" aria-hidden />
                  {create.isPending ? "Iniciando…" : "Iniciar encontro"}
                </Button>
              </form>
            ) : undefined
          }
        />
      ) : (
        <>
          {!canManage ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Iniciativa</span>
                <SearchableSelect
                  className="h-8 w-auto min-w-32 text-sm"
                  value={advantage}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "advantage", label: "Vantagem" },
                    { value: "disadvantage", label: "Desvantagem" },
                  ]}
                  onValueChange={(next) =>
                    setAdvantage(next as AdvantageMode)
                  }
                />
              </label>
            </div>
          ) : (
            <EncounterDmControls
              campaignId={campaignId}
              encounter={encounter}
              advantage={advantage}
              onAdvantageChange={setAdvantage}
            />
          )}

          {encounter.combatants.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              Ainda sem combatentes. Adicione criaturas ou aguarde os
              personagens entrarem na ordem.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-xl border border-border/80 bg-card/45 shadow-sm backdrop-blur-[2px]">
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
          )}
        </>
      )}

      {create.isError ? (
        <p className="text-sm text-destructive">
          {create.error instanceof Error
            ? create.error.message
            : "Falha ao criar encontro"}
        </p>
      ) : null}
    </div>
  );
}

function EncounterHeader({
  campaignId,
  campaignName,
  encounterName,
  round,
  playersCanView,
}: {
  campaignId: string;
  campaignName: string;
  encounterName?: string;
  round?: number;
  playersCanView?: boolean;
}) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_16%,transparent),transparent_50%)]"
        aria-hidden
      />
      <MarginCorner className="pointer-events-none absolute top-2 left-2 size-7 sm:size-8" />
      <MarginCorner
        mirror
        className="pointer-events-none absolute right-2 bottom-2 size-7 sm:size-8"
      />

      <div className="relative flex flex-col gap-3 p-4 sm:gap-3.5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackLink href={`/campaigns/${campaignId}`}>
            {campaignName}
          </BackLink>
          <div className="flex flex-wrap items-center gap-2">
            <SourceEditionBadge live />
            <Link
              href={`/campaigns/${campaignId}`}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
              )}
            >
              Voltar à campanha
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-start gap-3">
          <SealMark className="size-10 shrink-0 text-secondary sm:size-11" />
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {encounterName ?? "Encontro"}
            </h1>
            <InkFlourish className="h-3 w-32 text-secondary/60 sm:w-40" />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {round != null ? (
                <StatusChip active>Rodada {round}</StatusChip>
              ) : null}
              {playersCanView != null ? (
                <StatusChip>
                  {playersCanView ? "Visível aos jogadores" : "Só mestre"}
                </StatusChip>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
