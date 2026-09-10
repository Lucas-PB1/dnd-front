"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  LinkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";

import { useAuth } from "@/features/auth/model";
import { AVATAR_ACCEPT } from "@/features/auth/model/profile.schema";
import {
  duelStatusLabel,
  type DuelStatus,
} from "@/features/duel/duels/api/duels.api";
import {
  useDuel,
  useDuelAttack,
  useDuelActionSurgeAction,
  useDuelCast,
  useDuelCondition,
  useDuelSecondWindAction,
  useForfeitDuel,
  useSetDuelReady,
  useUploadDuelPortrait,
} from "@/features/duel/duels/api/use-duels";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

function StatusChip({ status }: { status: DuelStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "open"
          ? "border-secondary/50 bg-secondary/10 text-secondary"
          : status === "active" || status === "ready"
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-border/80 bg-muted/30 text-muted-foreground",
      )}
    >
      {duelStatusLabel(status)}
    </span>
  );
}

function CombatantCard({
  name,
  level,
  classSlug,
  hpCurrent,
  hpMax,
  tempHp,
  armorClass,
  initiative,
  conditions,
  portraitUrl,
  isTurn,
  isWinner,
  canUploadPortrait,
  onPickPortrait,
  uploadPending,
}: {
  name: string;
  level: number;
  classSlug: string;
  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  armorClass: number;
  initiative: number | null;
  conditions: string[];
  portraitUrl: string | null;
  isTurn: boolean;
  isWinner: boolean;
  canUploadPortrait: boolean;
  onPickPortrait?: (file: File) => void;
  uploadPending?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const ratio = hpMax > 0 ? Math.min(1, hpCurrent / hpMax) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isTurn ? "border-secondary bg-secondary/5" : "border-border/80",
        isWinner && "ring-1 ring-accent/60",
      )}
    >
      <div className="flex gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40">
          {portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitUrl}
              alt={`Retrato de ${name}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <PhotoIcon className="size-7 opacity-50" aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              N{level} · {classSlug}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            CA {armorClass}
            {initiative != null ? ` · Iniciativa ${initiative}` : null}
            {isTurn ? " · turno" : null}
          </p>
          {canUploadPortrait ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onPickPortrait?.(file);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadPending}
                onClick={() => fileRef.current?.click()}
              >
                {uploadPending
                  ? "Enviando…"
                  : portraitUrl
                    ? "Trocar retrato"
                    : "Enviar retrato"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span>PV</span>
          <span className="font-mono">
            {hpCurrent}/{hpMax}
            {tempHp > 0 ? ` (+${tempHp} temp)` : null}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              ratio > 0.5
                ? "bg-secondary"
                : ratio > 0.25
                  ? "bg-accent"
                  : "bg-destructive",
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
      {conditions.length > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Condições: {conditions.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

export function DuelDetailView({ duelId }: { duelId: string }) {
  const { user } = useAuth();
  const { data, isPending, isError, error } = useDuel(duelId);
  const readyMutation = useSetDuelReady(duelId);
  const attackMutation = useDuelAttack(duelId);
  const secondWindMutation = useDuelSecondWindAction(duelId);
  const actionSurgeMutation = useDuelActionSurgeAction(duelId);
  const castMutation = useDuelCast(duelId);
  const conditionMutation = useDuelCondition(duelId);
  const forfeitMutation = useForfeitDuel(duelId);
  const portraitMutation = useUploadDuelPortrait(duelId);
  const [linkCopied, setLinkCopied] = useState(false);
  const [bloodOption, setBloodOption] = useState("");
  const [takeLowerCost, setTakeLowerCost] = useState(false);
  const [armamentType, setArmamentType] = useState<
    "" | "acid" | "necrotic" | "poison"
  >("");
  const [explosionOnMiss, setExplosionOnMiss] = useState(false);
  const [masteryOverride, setMasteryOverride] = useState<
    "" | "push" | "sap" | "slow"
  >("");

  if (isPending) {
    return (
      <div className="space-y-4" role="status" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-muted/40" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error instanceof Error ? error.message : "Duelo não encontrado"}
      </p>
    );
  }

  const isSpectator = data.viewerRole === "spectator";
  const isParticipant = !isSpectator;
  const mine = data.combatants.find((c) => c.userId === user?.id);
  const waitingOpponent = data.members.length < 2;
  const lobbyOpen = data.status === "open" || data.status === "ready";
  const inCombat = data.status === "active";
  const finished = data.status === "finished" || data.status === "cancelled";

  async function copySpectatorLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/duels/${duelId}`
        : `/duels/${duelId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  }

  return (
    <div className="space-y-8" data-cy="duel-detail">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/duels"
          className={cn(
            buttonVariants({ size: "sm", variant: "ghost" }),
            "inline-flex items-center gap-1",
          )}
        >
          <ArrowLeftIcon className="size-3.5" aria-hidden />
          Duelos
        </Link>
        <StatusChip status={data.status} />
        {isSpectator ? (
          <span
            className="inline-flex rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground"
            data-cy="duel-spectator-badge"
          >
            Espectador
          </span>
        ) : null}
        {inCombat ? (
          <span className="text-sm text-muted-foreground">
            Rodada {data.round}
            {data.turnAttacksRemaining != null
              ? ` · Ataques restantes: ${data.turnAttacksRemaining}`
              : null}
          </span>
        ) : null}
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {inCombat || finished ? "Arena" : "Lobby do duelo"}
        </h1>
        {isSpectator ? (
          <p className="text-sm text-muted-foreground" role="status">
            Você está assistindo — sem ações de combate. A página atualiza
            sozinha.
          </p>
        ) : null}
        {lobbyOpen && isParticipant ? (
          <p className="text-sm text-muted-foreground">
            Código{" "}
            <span
              className="font-mono text-base tracking-wide text-foreground"
              data-cy="duel-invite-code"
            >
              {data.inviteCode}
            </span>
            {waitingOpponent
              ? " — compartilhe com a outra conta para jogar."
              : " — ambos no lobby; marquem prontos para iniciar."}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-cy="duel-copy-spectator-link"
            onClick={() => void copySpectatorLink()}
          >
            <LinkIcon className="size-3.5" aria-hidden />
            {linkCopied ? "Link copiado" : "Copiar link de espectador"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Outras contas logadas abrem o link só para assistir.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Sem mapa: distância, cobertura e voo não entram neste x1.
        </p>
        {data.arenaEffects.includes("magical_darkness") ? (
          <p
            className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm"
            role="status"
          >
            Arena em escuridão mágica
            {isParticipant && data.seesInMagicalDarkness
              ? " — você enxerga (Visão do Diabo)."
              : " — Visão no Escuro não atravessa."}
          </p>
        ) : null}
        {finished ? (
          <p className="text-sm text-muted-foreground">
            {data.endReason === "hp"
              ? "Vitória por PV."
              : data.endReason === "forfeit"
                ? "Vitória por desistência."
                : "Duelo encerrado."}
            {isParticipant && data.winnerUserId === user?.id
              ? " Você venceu."
              : null}
            {isParticipant &&
            data.winnerUserId &&
            data.winnerUserId !== user?.id
              ? " O oponente venceu."
              : null}
          </p>
        ) : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {data.combatants.map((c) => (
          <CombatantCard
            key={c.userId}
            name={c.characterName}
            level={c.level}
            classSlug={c.classSlug}
            hpCurrent={c.hitPointsCurrent}
            hpMax={c.hitPointsMax}
            tempHp={c.tempHp}
            armorClass={c.armorClass}
            initiative={c.initiative}
            conditions={c.conditions}
            portraitUrl={c.portraitUrl}
            isTurn={inCombat && data.turnCharacterId === c.characterId}
            isWinner={finished && data.winnerUserId === c.userId}
            canUploadPortrait={
              isParticipant && c.userId === user?.id && !finished
            }
            uploadPending={portraitMutation.isPending}
            onPickPortrait={(file) =>
              portraitMutation.mutate({ characterId: c.characterId, file })
            }
          />
        ))}
        {waitingOpponent ? (
          <div className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
            Aguardando oponente…
          </div>
        ) : null}
      </section>
      {portraitMutation.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {portraitMutation.error instanceof Error
            ? portraitMutation.error.message
            : "Erro ao enviar retrato"}
        </p>
      ) : null}

      {lobbyOpen && isParticipant && mine ? (
        <div className="flex flex-wrap gap-3">
          <Button
            data-cy="duel-ready"
            disabled={readyMutation.isPending || waitingOpponent}
            onClick={() => readyMutation.mutate(!mine.ready)}
          >
            {readyMutation.isPending
              ? "…"
              : mine.ready
                ? "Desmarcar pronto"
                : "Estou pronto"}
          </Button>
          <Button
            variant="outline"
            disabled={forfeitMutation.isPending}
            onClick={() => forfeitMutation.mutate()}
          >
            Cancelar / desistir
          </Button>
          {readyMutation.isError ? (
            <p className="w-full text-sm text-destructive" role="alert">
              {readyMutation.error instanceof Error
                ? readyMutation.error.message
                : "Erro ao marcar pronto"}
            </p>
          ) : null}
        </div>
      ) : null}

      {inCombat && isParticipant ? (
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">Armas</h2>
            {data.fighter && data.myTurn ? (
              <div
                className="space-y-2 rounded-lg border border-border/80 p-3"
                data-cy="duel-fighter-panel"
              >
                <p className="text-sm font-medium">
                  Guerreiro{" "}
                  <span className="text-muted-foreground">
                    ({data.turnAttacksRemaining ?? data.fighter.attacksPerAction}{" "}
                    ataque(s) restantes)
                  </span>
                </p>
                {data.fighter.tacticalMaster ? (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">
                      Mestre Tático (maestria)
                    </span>
                    <select
                      className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                      value={masteryOverride}
                      data-cy="duel-mastery-override"
                      onChange={(e) =>
                        setMasteryOverride(
                          e.target.value as "" | "push" | "sap" | "slow",
                        )
                      }
                    >
                      <option value="">Maestria da arma</option>
                      <option value="push">Empurrar</option>
                      <option value="sap">Drenar</option>
                      <option value="slow">Lento</option>
                    </select>
                  </label>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      secondWindMutation.isPending ||
                      data.fighter.secondWindRemaining <= 0
                    }
                    data-cy="duel-second-wind"
                    onClick={() => secondWindMutation.mutate()}
                  >
                    Recuperar Fôlego ({data.fighter.secondWindRemaining}/
                    {data.fighter.secondWindMax})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      actionSurgeMutation.isPending ||
                      data.fighter.actionSurgeRemaining <= 0
                    }
                    data-cy="duel-action-surge"
                    onClick={() => actionSurgeMutation.mutate()}
                  >
                    Surto de Ação ({data.fighter.actionSurgeRemaining}/
                    {data.fighter.actionSurgeMax})
                  </Button>
                </div>
                {secondWindMutation.isError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {secondWindMutation.error instanceof Error
                      ? secondWindMutation.error.message
                      : "Erro no Recuperar Fôlego"}
                  </p>
                ) : null}
                {actionSurgeMutation.isError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {actionSurgeMutation.error instanceof Error
                      ? actionSurgeMutation.error.message
                      : "Erro no Surto de Ação"}
                  </p>
                ) : null}
              </div>
            ) : null}
            {data.bloodStrike && data.myTurn ? (
              <div
                className="space-y-2 rounded-lg border border-border/80 p-3"
                data-cy="duel-blood-strike-panel"
              >
                <p className="text-sm font-medium">
                  Golpe de Sangue{" "}
                  <span className="text-muted-foreground">
                    ({data.bloodStrike.remaining}/{data.bloodStrike.max} · CD{" "}
                    {data.bloodStrike.saveDc})
                  </span>
                </p>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Opção</span>
                  <select
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                    value={bloodOption}
                    data-cy="duel-blood-strike-option"
                    onChange={(e) => setBloodOption(e.target.value)}
                  >
                    <option value="">Sem golpe</option>
                    {data.bloodStrike.options.map((opt) => (
                      <option key={opt.slug} value={opt.slug}>
                        {opt.label} ({opt.costDice})
                      </option>
                    ))}
                  </select>
                </label>
                {data.bloodStrike.canTakeLowerCost ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={takeLowerCost}
                      onChange={(e) => setTakeLowerCost(e.target.checked)}
                      data-cy="duel-blood-lower-cost"
                    />
                    Menor custo (Sangue da Criação)
                  </label>
                ) : null}
                {data.bloodStrike.canArmament ? (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">
                      Armamento de Sangue
                    </span>
                    <select
                      className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                      value={armamentType}
                      data-cy="duel-blood-armament"
                      onChange={(e) =>
                        setArmamentType(
                          e.target.value as "" | "acid" | "necrotic" | "poison",
                        )
                      }
                    >
                      <option value="">Tipo normal da arma</option>
                      <option value="acid">Ácido</option>
                      <option value="necrotic">Necrótico</option>
                      <option value="poison">Veneno</option>
                    </select>
                  </label>
                ) : null}
                {data.bloodStrike.canExplosion ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={explosionOnMiss}
                      onChange={(e) => setExplosionOnMiss(e.target.checked)}
                      data-cy="duel-blood-explosion"
                    />
                    Explosão se errar
                  </label>
                ) : null}
              </div>
            ) : null}
            {data.myTurn ? (
              data.myWeapons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Equipe uma arma na ficha para atacar.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.myWeapons.map((weapon) => (
                    <li key={`${weapon.itemSlug}-${weapon.mode}`}>
                      <Button
                        size="sm"
                        disabled={attackMutation.isPending}
                        data-cy="duel-attack"
                        onClick={() =>
                          attackMutation.mutate({
                            itemSlug: weapon.itemSlug,
                            mode: weapon.mode,
                            ...(bloodOption
                              ? {
                                  bloodStrike: {
                                    optionSlug: bloodOption,
                                    takeLowerBloodCost: takeLowerCost || undefined,
                                  },
                                }
                              : {}),
                            ...(armamentType
                              ? { damageTypeOverride: armamentType }
                              : {}),
                            ...(explosionOnMiss
                              ? { bloodExplosionOnMiss: true }
                              : {}),
                            ...(masteryOverride
                              ? { masteryOverrideSlug: masteryOverride }
                              : {}),
                          })
                        }
                      >
                        {weapon.itemName} (
                        {weapon.mode === "melee" ? "CdC" : "dist."}){" "}
                        {weapon.attackBonus >= 0 ? "+" : ""}
                        {weapon.attackBonus}
                      </Button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Aguarde o turno do oponente…
              </p>
            )}
            {attackMutation.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {attackMutation.error instanceof Error
                  ? attackMutation.error.message
                  : "Erro no ataque"}
              </p>
            ) : null}
          </div>

          {data.myTurn ? (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">Magias</h2>
              <p className="text-xs text-muted-foreground">
                Tipados: Escuridão, Mísseis Mágicos, Raio de Fogo. Outras gastam
                slot e registram nota.
              </p>
              {data.mySpells.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma magia na ficha.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.mySpells.map((spell) => (
                    <li key={`${spell.spellSlug}-${spell.listType}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={castMutation.isPending}
                        data-cy="duel-cast"
                        onClick={() =>
                          castMutation.mutate({
                            spellSlug: spell.spellSlug,
                            slotLevel:
                              spell.spellSlug === "escuridao"
                                ? 2
                                : spell.spellSlug === "misseis-magicos"
                                  ? 1
                                  : undefined,
                          })
                        }
                      >
                        {spell.spellSlug}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {castMutation.isError ? (
                <p className="text-sm text-destructive" role="alert">
                  {castMutation.error instanceof Error
                    ? castMutation.error.message
                    : "Erro ao conjurar"}
                </p>
              ) : null}
            </div>
          ) : null}

          {data.myTurn ? (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">Condições</h2>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["poisoned", "Envenenado"],
                    ["prone", "Caído"],
                    ["frightened", "Amedrontado"],
                    ["restrained", "Contido"],
                    ["blinded", "Cego"],
                  ] as const
                ).map(([slug, label]) => (
                  <Button
                    key={slug}
                    size="sm"
                    variant="outline"
                    disabled={conditionMutation.isPending}
                    onClick={() =>
                      conditionMutation.mutate({
                        action: "add",
                        target: "opponent",
                        condition: slug,
                      })
                    }
                  >
                    {label} no oponente
                  </Button>
                ))}
              </div>
              {conditionMutation.isError ? (
                <p className="text-sm text-destructive" role="alert">
                  {conditionMutation.error instanceof Error
                    ? conditionMutation.error.message
                    : "Erro na condição"}
                </p>
              ) : null}
            </div>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            disabled={forfeitMutation.isPending}
            onClick={() => forfeitMutation.mutate()}
          >
            Desistir
          </Button>
        </section>
      ) : null}

      {inCombat && isSpectator ? (
        <p className="text-sm text-muted-foreground">
          Combate em andamento — acompanhe o log abaixo.
        </p>
      ) : null}

      {data.combatLog.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Log</h2>
          <ol className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border/80 p-4 text-sm">
            {[...data.combatLog].reverse().map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="text-muted-foreground">
                <span className="font-mono text-xs text-muted-foreground/80">
                  {new Date(entry.at).toLocaleTimeString("pt-BR")}
                </span>{" "}
                <span className="text-foreground">{entry.text}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
