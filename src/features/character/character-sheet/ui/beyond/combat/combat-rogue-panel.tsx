"use client";

import { useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeRogueTableAction,
  type RogueTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
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
  const hasFreeSoulknifeUse =
    (resource("psychic-whispers")?.remaining ?? 0) > 0 ||
    (resource("psychic-veil")?.remaining ?? 0) > 0 ||
    (resource("rend-mind")?.remaining ?? 0) > 0;

  function soulknifeLabel(
    name: string,
    freeSlug: string,
    psiCost = 1,
  ): string {
    const freeLeft = resource(freeSlug)?.remaining ?? 0;
    if (!usePsiDie && freeLeft > 0) return `${name} (gratuito)`;
    return `${name} (${psiCost} dado${psiCost > 1 ? "s" : ""})`;
  }

  const actionsContent = (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
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
          disabled={
            rolls.initiative.isPending ||
            (resource("strokeOfLuck")?.remaining ?? 0) <= 0
          }
          title="Golpe de Sorte: transforma falha crítica em sucesso (nv. 20)"
          onClick={() => rolls.initiative.mutate({ strokeOfLuck: true })}
        >
          Golpe de Sorte na iniciativa ({resource("strokeOfLuck")?.remaining ?? 0})
        </Button>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const soulknifePowersContent = subclassSlug === "soulknife" ? (
    <div className="space-y-2">
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
              {soulknifeLabel("Sussurros Psíquicos", "psychic-whispers")}
            </Button>
            {level >= 9 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={action.isPending || psiRemaining <= 0}
                onClick={() => action.mutate("psychic-teleport")}
              >
                Teleporte Psíquico (1 dado)
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
                {soulknifeLabel("Véu Psíquico", "psychic-veil")}
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
                {soulknifeLabel("Rasgar Mente", "rend-mind", 3)}
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
            {hasFreeSoulknifeUse || usePsiDie ? (
              <label className="text-[0.7rem] text-muted-foreground">
                <input
                  className="mr-1 align-middle"
                  type="checkbox"
                  checked={usePsiDie}
                  onChange={(event) => setUsePsiDie(event.target.checked)}
                />
                gastar dado psi (em vez do uso gratuito) · {psiRemaining}
              </label>
            ) : (
              <span className="text-[0.7rem] text-muted-foreground">
                Dados psi: {psiRemaining}
              </span>
            )}
          </div>
        </>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  ) : null;

  const tricksterPowersContent =
    subclassSlug === "arcane-trickster" && level >= 17 ? (
      <div className="space-y-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={
            action.isPending || (resource("spell-thief")?.remaining ?? 0) <= 0
          }
          title="Ladrão de Magias: roubar magia de oponente (1×/descanso)"
          onClick={() => action.mutate("spell-thief")}
        >
          Ladrão de Magias ({resource("spell-thief")?.remaining ?? 0})
        </Button>

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  const thiefPowersContent =
    subclassSlug === "thief" && level >= 13 ? (
      <div className="space-y-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending}
          title="Usar Item Mágico: teste para recarregar item (nv. 13+)"
          onClick={() => action.mutate("magic-device-charge")}
        >
          Testar carga de item mágico
        </Button>

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  const arachnoidPowersContent = subclassSlug === "arachnoid-stalker" ? (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={
          action.isPending || (resource("arachnoid-web")?.remaining ?? 0) <= 0
        }
        title="Correia Aracnóide: criar teia ou correia (gasta 1 uso)"
        onClick={() => action.mutate("arachnoid-web")}
      >
        Correia/Teia ({resource("arachnoid-web")?.remaining ?? 0})
      </Button>

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  ) : null;

  const powersContent =
    soulknifePowersContent ??
    tricksterPowersContent ??
    thiefPowersContent ??
    arachnoidPowersContent;

  return (
    <CombatClassPanelShell
      title="Combate do Ladino"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
