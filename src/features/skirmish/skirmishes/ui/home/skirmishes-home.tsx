"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { useCreatureTemplatesCatalog } from "@/features/catalog/creature-template-catalog/api/use-creature-templates";
import { useCharacters } from "@/features/character/characters/api/use-characters";
import { type SkirmishSummary } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import {
  useCreateSkirmish,
  useDeleteSkirmish,
  useFinishSkirmish,
  useSkirmishes,
} from "@/features/skirmish/skirmishes/api/use-skirmishes";
import { SkirmishStatusChip } from "@/features/skirmish/skirmishes/ui/skirmish-status-chip";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { EmptyMapMark } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { SearchableSelect } from "@/shared/ui/searchable-select";

function SkirmishRow({ skirmish }: { skirmish: SkirmishSummary }) {
  const finish = useFinishSkirmish(skirmish.id);
  const remove = useDeleteSkirmish();
  const title = skirmish.opponentName
    ? `${skirmish.characterName} vs ${skirmish.opponentName}`
    : skirmish.characterName;
  const busy = finish.isPending || remove.isPending;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        motion.hoverRow,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading font-medium">{title}</p>
          <SkirmishStatusChip status={skirmish.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Rodada {skirmish.round}
          {skirmish.winnerKind === "pc"
            ? " · vitória"
            : skirmish.winnerKind === "actor"
              ? " · derrota"
              : skirmish.status === "finished"
                ? " · encerrado"
                : null}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {skirmish.status === "active" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Encerrar este combate agora?")) {
                finish.mutate();
              }
            }}
          >
            Encerrar
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Excluir este combate?")) {
              remove.mutate(skirmish.id);
            }
          }}
        >
          Excluir
        </Button>
        <Link
          href={`/skirmishes/${skirmish.id}`}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "inline-flex items-center gap-1",
          )}
        >
          Abrir
          <ArrowRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>
    </li>
  );
}

export function SkirmishesHome() {
  const list = useSkirmishes();
  const characters = useCharacters();
  const catalog = useCreatureTemplatesCatalog();
  const create = useCreateSkirmish();
  const [characterId, setCharacterId] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");

  const characterOptions = useMemo(
    () =>
      (characters.data ?? []).map((row) => ({
        value: row.id,
        label: row.name,
      })),
    [characters.data],
  );

  const templateOptions = useMemo(
    () =>
      (catalog.data?.data ?? []).map((row) => ({
        value: row.slug,
        label: `${row.name}${row.challengeRating ? ` · ND ${row.challengeRating}` : ""}`,
      })),
    [catalog.data?.data],
  );

  const active = (list.data ?? []).find((row) => row.status === "active");

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!characterId || !templateSlug) return;
    create.mutate({ characterId, templateSlug });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <h2 className="font-heading text-lg font-semibold">Novo skirmish</h2>
        <p className="text-sm text-muted-foreground">
          Um personagem contra uma criatura do catálogo. A API resolve acerto,
          dano e o turno do monstro.
        </p>
        {active ? (
          <p className="text-sm text-muted-foreground">
            Já existe um combate ativo.{" "}
            <Link
              href={`/skirmishes/${active.id}`}
              className="underline underline-offset-2"
            >
              Continuar {active.characterName} vs {active.opponentName}
            </Link>
          </p>
        ) : (
          <form
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
            onSubmit={onCreate}
          >
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Personagem</span>
              <SearchableSelect
                className="h-9 w-full text-sm"
                value={characterId}
                options={characterOptions}
                onValueChange={setCharacterId}
                placeholder="Escolher ficha"
              />
            </label>
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Criatura</span>
              <SearchableSelect
                className="h-9 w-full text-sm"
                value={templateSlug}
                options={templateOptions}
                onValueChange={setTemplateSlug}
                placeholder="Escolher do catálogo"
              />
            </label>
            <Button
              type="submit"
              disabled={
                !characterId || !templateSlug || create.isPending
              }
            >
              {create.isPending ? "Iniciando…" : "Começar"}
            </Button>
          </form>
        )}
        {create.isError ? (
          <p className="text-sm text-destructive">
            {create.error instanceof Error
              ? create.error.message
              : "Não foi possível iniciar o skirmish"}
          </p>
        ) : null}
      </section>

      {list.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando combates…</p>
      ) : list.isError ? (
        <p className="text-sm text-destructive">
          {list.error instanceof Error
            ? list.error.message
            : "Falha ao listar skirmishes"}
        </p>
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhum skirmish ainda"
          description="Escolha um personagem e uma criatura para começar o duelo solo."
          icon={<EmptyMapMark className="size-10" />}
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/80">
          {(list.data ?? []).map((row) => (
            <SkirmishRow key={row.id} skirmish={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
