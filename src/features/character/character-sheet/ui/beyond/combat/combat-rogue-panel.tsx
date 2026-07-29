"use client";

import { useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeRogueTableAction,
  type RogueTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { Button } from "@/shared/ui/button";

type CombatRoguePanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatRoguePanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatRoguePanelProps) {
  const rolls = useSheetRolls();
  const [checkTotal, setCheckTotal] = useState("10");
  const [dc, setDc] = useState("15");
  const [usePsiDie, setUsePsiDie] = useState(false);
  const action = useTableActionMutation(
    characterId,
    (token: string, id: string, actionSlug: RogueTableActionSlug) => {
      return executeRogueTableAction(token, id, {
        actionSlug,
        checkTotal: Number(checkTotal) || undefined,
        dc: Number(dc) || undefined,
        usePsiDie,
      });
    },
  );

  if (classSlug !== "rogue") return null;

  const resource = (slug: string) =>
    state?.classResources?.find((item) => item.slug === slug);
  const psiRemaining = resource("soulknife-psi-dice")?.remaining ?? 0;

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Ladino
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ataque Furtivo:{" "}
        <span className="font-semibold text-foreground">
          {Math.ceil(level / 2)}d6
        </span>
        {subclassSlug === "arachnoid-stalker" ? " (ou d8 Venenoso)" : ""}
      </p>
      {level >= 20 ? (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="mt-2"
          disabled={
            rolls.initiative.isPending ||
            (resource("strokeOfLuck")?.remaining ?? 0) <= 0
          }
          onClick={() => rolls.initiative.mutate({ strokeOfLuck: true })}
        >
          Golpe de Sorte na iniciativa
        </Button>
      ) : null}

      {subclassSlug === "soulknife" ? (
        <>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={action.isPending}
              onClick={() => action.mutate("psychic-blade-main")}
            >
              Lâmina Psíquica
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={action.isPending}
              onClick={() => action.mutate("psychic-blade-bonus")}
            >
              Lâmina adicional
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={
                action.isPending ||
                (usePsiDie
                  ? psiRemaining <= 0
                  : (resource("psychic-whispers")?.remaining ?? 0) <= 0)
              }
              onClick={() => action.mutate("psychic-whispers")}
            >
              Sussurros Psíquicos
            </Button>
            {level >= 9 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={action.isPending || psiRemaining <= 0}
                onClick={() => action.mutate("psychic-teleport")}
              >
                Teleporte Psíquico
              </Button>
            ) : null}
            {level >= 13 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  action.isPending ||
                  (usePsiDie
                    ? psiRemaining <= 0
                    : (resource("psychic-veil")?.remaining ?? 0) <= 0)
                }
                onClick={() => action.mutate("psychic-veil")}
              >
                Véu Psíquico
              </Button>
            ) : null}
            {level >= 17 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  action.isPending ||
                  (usePsiDie
                    ? psiRemaining < 3
                    : (resource("rend-mind")?.remaining ?? 0) <= 0)
                }
                onClick={() => action.mutate("rend-mind")}
              >
                Rasgar Mente
              </Button>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="text-[0.7rem] text-muted-foreground">
              Total atual
              <input
                className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
                value={checkTotal}
                inputMode="numeric"
                onChange={(event) => setCheckTotal(event.target.value)}
              />
            </label>
            <label className="text-[0.7rem] text-muted-foreground">
              CD/CA
              <input
                className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
                value={dc}
                inputMode="numeric"
                onChange={(event) => setDc(event.target.value)}
              />
            </label>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={action.isPending || psiRemaining <= 0}
              onClick={() => action.mutate("psi-bolstered-knack")}
            >
              Aptidão Reforçada
            </Button>
            {level >= 9 ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={action.isPending || psiRemaining <= 0}
                onClick={() => action.mutate("guided-strike")}
              >
                Golpe Teleguiado
              </Button>
            ) : null}
            <label className="text-[0.7rem] text-muted-foreground">
              <input
                className="mr-1 align-middle"
                type="checkbox"
                checked={usePsiDie}
                onChange={(event) => setUsePsiDie(event.target.checked)}
              />
              usar dado psi ({psiRemaining})
            </label>
          </div>
        </>
      ) : null}

      {subclassSlug === "arcane-trickster" && level >= 17 ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={
            action.isPending || (resource("spell-thief")?.remaining ?? 0) <= 0
          }
          onClick={() => action.mutate("spell-thief")}
        >
          Ladrão de Magias
        </Button>
      ) : null}

      {subclassSlug === "thief" && level >= 13 ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={action.isPending}
          onClick={() => action.mutate("magic-device-charge")}
        >
          Testar carga de item mágico
        </Button>
      ) : null}

      {subclassSlug === "arachnoid-stalker" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={
            action.isPending || (resource("arachnoid-web")?.remaining ?? 0) <= 0
          }
          onClick={() => action.mutate("arachnoid-web")}
        >
          Correia/Teia ({resource("arachnoid-web")?.remaining ?? 0})
        </Button>
      ) : null}

      {combatNotes?.length ? (
        <ul className="mt-2 space-y-1 text-[0.7rem] text-muted-foreground">
          {combatNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );
}
