"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  EyeIcon,
  KeyIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useMemo, useState } from "react";

import { useCharacters } from "@/features/character/characters/api/use-characters";
import {
  duelStatusLabel,
  type DuelStatus,
  type DuelSummary,
} from "@/features/duel/duels/api/duels.api";
import {
  useCreateDuel,
  useDuels,
  useJoinDuel,
} from "@/features/duel/duels/api/use-duels";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { EmptyMapMark } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { SearchableSelect } from "@/shared/ui/searchable-select";

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

function DuelRow({ duel }: { duel: DuelSummary }) {
  const title =
    duel.myCharacter && duel.opponentCharacter
      ? `${duel.myCharacter.name} vs ${duel.opponentCharacter.name}`
      : duel.myCharacter
        ? `${duel.myCharacter.name} — aguardando oponente`
        : "Duelo";

  return (
    <li
      data-cy="duel-row"
      data-duel-id={duel.id}
      className={cn(
        "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        motion.hoverRow,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading font-medium" data-cy="duel-row-name">
            {title}
          </p>
          <StatusChip status={duel.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Código{" "}
          <span className="font-mono tracking-wide">{duel.inviteCode}</span>
        </p>
      </div>
      <Link
        href={`/duels/${duel.id}`}
        data-cy="duel-open"
        className={cn(
          buttonVariants({ size: "sm", variant: "outline" }),
          "inline-flex items-center gap-1",
        )}
      >
        Abrir
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </Link>
    </li>
  );
}

function DuelsListSkeleton() {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-xl border border-border/80"
      role="status"
      aria-busy="true"
      aria-label="Carregando duelos"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted/30" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-muted/35" />
        </li>
      ))}
    </ul>
  );
}

export function DuelsHome() {
  const router = useRouter();
  const { data, isPending, isError, error } = useDuels();
  const characters = useCharacters();
  const create = useCreateDuel();
  const join = useJoinDuel();
  const [createCharacterId, setCreateCharacterId] = useState("");
  const [joinCharacterId, setJoinCharacterId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [watchInput, setWatchInput] = useState("");
  const [watchError, setWatchError] = useState<string | null>(null);

  const characterOptions = useMemo(
    () =>
      (characters.data ?? []).map((c) => ({
        value: c.id,
        label: `${c.name} · N${c.level} ${c.className}`,
      })),
    [characters.data],
  );

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!createCharacterId) return;
    create.mutate({ characterId: createCharacterId });
  }

  function onJoin(event: FormEvent) {
    event.preventDefault();
    if (!inviteCode.trim() || !joinCharacterId) return;
    join.mutate({
      inviteCode: inviteCode.trim(),
      characterId: joinCharacterId,
    });
  }

  function onWatch(event: FormEvent) {
    event.preventDefault();
    setWatchError(null);
    const raw = watchInput.trim();
    if (!raw) return;
    const fromUrl = raw.match(
      /\/duels\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    const id = (fromUrl?.[1] ?? raw).toLowerCase();
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (!uuidRe.test(id)) {
      setWatchError("Cole o link do duelo ou o id (UUID).");
      return;
    }
    router.push(`/duels/${id}`);
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
        <form
          data-cy="duel-create-form"
          onSubmit={onCreate}
          className="space-y-3 lg:pr-10"
        >
          <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
            <PlusCircleIcon className="size-5 text-secondary" aria-hidden />
            Novo duelo
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha seu personagem e compartilhe o código com o oponente (outra
            conta). Use o link da arena para espectadores.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Seu personagem</span>
            <SearchableSelect
              id="duel-create-character"
              aria-label="Personagem para criar duelo"
              className="h-9"
              value={createCharacterId}
              options={characterOptions}
              placeholder={
                characters.isPending
                  ? "Carregando fichas…"
                  : "Selecione uma ficha"
              }
              onValueChange={setCreateCharacterId}
            />
          </label>
          <Button
            type="submit"
            data-cy="duel-create-submit"
            disabled={
              create.isPending || !createCharacterId || characters.isPending
            }
          >
            {create.isPending ? "Criando…" : "Criar"}
          </Button>
          {create.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {create.error instanceof Error
                ? create.error.message
                : "Erro ao criar"}
            </p>
          ) : null}
        </form>

        <form
          data-cy="duel-join-form"
          onSubmit={onJoin}
          className="space-y-3 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
        >
          <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
            <KeyIcon className="size-5 text-accent" aria-hidden />
            Entrar com código
          </h2>
          <p className="text-sm text-muted-foreground">
            Use o código do oponente e escolha o personagem que vai lutar.
          </p>
          <Input
            data-cy="duel-join-code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Código do convite"
            maxLength={16}
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Seu personagem</span>
            <SearchableSelect
              id="duel-join-character"
              aria-label="Personagem para entrar no duelo"
              className="h-9"
              value={joinCharacterId}
              options={characterOptions}
              placeholder={
                characters.isPending
                  ? "Carregando fichas…"
                  : "Selecione uma ficha"
              }
              onValueChange={setJoinCharacterId}
            />
          </label>
          <Button
            type="submit"
            data-cy="duel-join-submit"
            disabled={
              join.isPending ||
              !inviteCode.trim() ||
              !joinCharacterId ||
              characters.isPending
            }
          >
            {join.isPending ? "Entrando…" : "Entrar"}
          </Button>
          {join.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {join.error instanceof Error
                ? join.error.message
                : "Erro ao entrar"}
            </p>
          ) : null}
        </form>
      </div>

      <form
        data-cy="duel-watch-form"
        onSubmit={onWatch}
        className="space-y-3 rounded-xl border border-border/80 p-4"
      >
        <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
          <EyeIcon className="size-5 text-muted-foreground" aria-hidden />
          Assistir com link
        </h2>
        <p className="text-sm text-muted-foreground">
          Cole o link de espectador (ou o id do duelo). Conta logada necessária;
          só leitura.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            data-cy="duel-watch-input"
            value={watchInput}
            onChange={(e) => setWatchInput(e.target.value)}
            placeholder="https://…/duels/uuid ou uuid"
            className="sm:flex-1"
          />
          <Button type="submit" variant="outline" disabled={!watchInput.trim()}>
            Assistir
          </Button>
        </div>
        {watchError ? (
          <p className="text-sm text-destructive" role="alert">
            {watchError}
          </p>
        ) : null}
      </form>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Seus duelos</h2>
        {isPending ? <DuelsListSkeleton /> : null}
        {isError ? (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error ? error.message : "Erro ao carregar"}
          </p>
        ) : null}
        {!isPending && !isError && (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<EmptyMapMark className="size-10" />}
            title="Nenhum duelo ainda"
            description="Crie um desafio ou entre com o código de outra conta."
          />
        ) : null}
        {!isPending && (data?.length ?? 0) > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/80">
            {data!.map((duel) => (
              <DuelRow key={duel.id} duel={duel} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
