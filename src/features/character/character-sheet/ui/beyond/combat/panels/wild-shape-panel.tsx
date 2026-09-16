"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { CharacterState } from "@/entities/character/session-types";
import type { WildShapeEligibleBeast } from "@/entities/character/wild-shape-eligible";
import type { DruidTableActionInput } from "@/features/character/character-sheet/api/character-session.api";
import { useWildShapeEligible } from "@/features/character/character-sheet/api/use-wild-shape-eligible";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "@/features/character/character-sheet/ui/beyond/combat/shared/panel-action-row";
import { Button } from "@/shared/ui/button";

const WILD_SHAPE_MIN_LEVEL = 2;

type WildShapePanelProps = {
  characterId: string;
  level: number;
  state: CharacterState | undefined;
  isPending: boolean;
  onAction: (input: DruidTableActionInput) => void;
};

function beastLine(beast: WildShapeEligibleBeast): string {
  const parts: string[] = [];
  if (beast.armorClass != null) parts.push(`CA ${beast.armorClass}`);
  if (beast.hasFlySpeed) parts.push("voo");
  return parts.join(" · ");
}

function fallbackBeast(slug: string): WildShapeEligibleBeast {
  return {
    slug,
    name: slug,
    challengeRating: null,
    armorClass: null,
    hasFlySpeed: false,
    known: true,
  };
}

export function WildShapePanel({
  characterId,
  level,
  state,
  isPending,
  onAction,
}: WildShapePanelProps) {
  const eligibleQuery = useWildShapeEligible(
    characterId,
    level >= WILD_SHAPE_MIN_LEVEL,
  );
  const [replaceSlug, setReplaceSlug] = useState<string | null>(null);

  const list = eligibleQuery.data;
  const knownSlugs = state?.wildShapeKnownSlugs ?? list?.knownSlugs ?? [];
  const maxKnown = list?.maxKnownForms ?? 0;
  const swapAvailable =
    state?.wildShapeFormSwapAvailable ?? list?.formSwapAvailable ?? false;
  const activeSlug = state?.wildShapeTemplateSlug ?? null;
  const actorId = state?.wildShapeActorId ?? null;

  const beastsBySlug = useMemo(() => {
    const map = new Map<string, WildShapeEligibleBeast>();
    for (const beast of list?.beasts ?? []) {
      map.set(beast.slug, beast);
    }
    return map;
  }, [list?.beasts]);

  const knownBeasts = knownSlugs.map(
    (slug) => beastsBySlug.get(slug) ?? fallbackBeast(slug),
  );
  const unknownBeasts = (list?.beasts ?? []).filter(
    (beast) => !knownSlugs.includes(beast.slug),
  );

  if (level < WILD_SHAPE_MIN_LEVEL) return null;

  const activeName =
    (activeSlug && beastsBySlug.get(activeSlug)?.name) || activeSlug;
  const canLearn = knownSlugs.length < maxKnown;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Forma Selvagem:{" "}
        <span className="font-medium text-foreground">
          {state?.wildShapeActive && activeName ? activeName : "inativa"}
        </span>
        {list ? ` · conhecidas ${knownSlugs.length}/${maxKnown}` : null}
      </p>
      {actorId ? (
        <Link
          href={`/actors/${actorId}`}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Abrir ficha da forma
        </Link>
      ) : null}
      {state?.wildShapeActive ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending || !state}
          onClick={() => onAction({ actionSlug: "wild-shape-end" })}
        >
          Encerrar forma
        </Button>
      ) : null}
      {eligibleQuery.isPending ? (
        <p className="text-xs text-muted-foreground">Carregando bestas…</p>
      ) : null}
      {eligibleQuery.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {(eligibleQuery.error as Error)?.message ??
            "Não foi possível listar formas elegíveis"}
        </p>
      ) : null}

      {knownBeasts.length > 0 ? (
        <CombatPanelActionList
          title="Formas conhecidas"
          count={knownBeasts.length}
          defaultOpen
        >
          {knownBeasts.map((beast) => (
            <CombatPanelActionRow
              key={beast.slug}
              name={
                beast.slug === activeSlug
                  ? `${beast.name} (ativa)`
                  : beast.name
              }
              description={beastLine(beast)}
              actionLabel="Assumir"
              disabled={!state || beast.slug === activeSlug}
              pending={isPending}
              onAction={() =>
                onAction({
                  actionSlug: "wild-shape",
                  templateSlug: beast.slug,
                })
              }
            />
          ))}
        </CombatPanelActionList>
      ) : (
        <p className="text-xs text-muted-foreground">
          Nenhuma forma conhecida. Aprenda bestas na lista abaixo.
        </p>
      )}

      {swapAvailable && knownBeasts.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {knownBeasts.map((beast) => (
            <Button
              key={`swap-${beast.slug}`}
              type="button"
              size="xs"
              variant={replaceSlug === beast.slug ? "secondary" : "ghost"}
              disabled={isPending}
              onClick={() =>
                setReplaceSlug((current) =>
                  current === beast.slug ? null : beast.slug,
                )
              }
            >
              Trocar {beast.name}
            </Button>
          ))}
        </div>
      ) : null}

      {unknownBeasts.length > 0 ? (
        <CombatPanelActionList
          title="Bestas elegíveis"
          count={unknownBeasts.length}
        >
          {unknownBeasts.map((beast) => {
            const replacing = Boolean(replaceSlug);
            const actionLabel = canLearn
              ? "Aprender"
              : replacing
                ? "Trocar por esta"
                : "Sem slot";
            return (
              <CombatPanelActionRow
                key={beast.slug}
                name={beast.name}
                description={beastLine(beast)}
                actionLabel={actionLabel}
                disabled={!state || (!canLearn && !replacing)}
                pending={isPending}
                onAction={() => {
                  if (canLearn) {
                    onAction({
                      actionSlug: "set-wild-shape-known-forms",
                      templateSlugs: [...knownSlugs, beast.slug],
                    });
                    return;
                  }
                  if (replaceSlug) {
                    onAction({
                      actionSlug: "replace-wild-shape-known-form",
                      replaceSlug,
                      templateSlug: beast.slug,
                    });
                    setReplaceSlug(null);
                  }
                }}
              />
            );
          })}
        </CombatPanelActionList>
      ) : null}
    </div>
  );
}
