"use client";

import { useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import { executePaladinTableAction } from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { economyActionDetailText } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { paladinProtectiveSmiteReminder } from "@/features/character/character-sheet/lib/combat/paladin-protective-smite";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { FeatureDetailTrigger } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { CombatToggleChip } from "../shared/combat-toggle-chip";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatPaladinPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  onTableNote?: (note: string) => void;
};

export function CombatPaladinPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
  onTableNote,
}: CombatPaladinPanelProps) {
  const [healAmount, setHealAmount] = useState(1);
  const action = useTableActionMutation(characterId, executePaladinTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;
  const protectiveSmite = paladinProtectiveSmiteReminder(
    mechanicalCatalog.data?.economyActions ?? [],
    { level, subclassSlug },
  );

  const channelActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "paladin",
        level,
        section: "channel",
        subclassSlug,
      }),
    [panelCatalog, level, subclassSlug],
  );

  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "paladin",
        level,
        section: "subclass",
        subclassSlug,
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (classSlug !== "paladin") return null;

  const layOnHands = state?.classResources?.find(
    (item) => item.slug === "layOnHands",
  );
  const channel = state?.classResources?.find(
    (item) => item.slug === "channelDivinity",
  );
  const poolRemaining = layOnHands?.remaining ?? 0;
  const channelRemaining = channel?.remaining ?? 0;
  const sacredWeaponActive = state?.sacredWeaponActive ?? false;

  function getRemaining(slug: string): number | null {
    if (slug === "layOnHands") return poolRemaining;
    if (slug === "channelDivinity") return channelRemaining;
    return (
      state?.classResources?.find((entry) => entry.slug === slug)?.remaining ??
      null
    );
  }

  function run(actionSlug: string, amount?: number) {
    action.mutate(
      amount != null ? { actionSlug, amount } : { actionSlug },
      {
        onSuccess: (result) => {
          if (result?.note) onTableNote?.(result.note);
        },
      },
    );
  }

  const actionsContent = (
    <div className="space-y-2">
      {subclassSlug === "devotion" ? (
        <div className="flex flex-wrap items-center gap-2">
          <CombatToggleChip
            label={
              sacredWeaponActive ? "Arma Sagrada ativa" : "Arma Sagrada"
            }
            active={sacredWeaponActive}
            disabled={
              !state ||
              action.isPending ||
              (!sacredWeaponActive && channelRemaining < 1)
            }
            title={
              sacredWeaponActive
                ? "Encerrar Arma Sagrada (sem ação)"
                : channelRemaining < 1
                  ? "Sem usos de Canalizar Divindade"
                  : "Ativar via Canalizar do Juramento (gasta 1 Canalizar)"
            }
            onToggle={() => {
              if (sacredWeaponActive) run("end-sacred-weapon");
              else run("oath-channel");
            }}
          />
        </div>
      ) : null}

      {layOnHands ? (
        <div>
          <p className="text-sm text-muted-foreground">
            Mãos Consagradas:{" "}
            <span className="font-semibold text-foreground">
              {poolRemaining}/{layOnHands.max} PV
            </span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              max={Math.max(1, poolRemaining)}
              value={healAmount}
              onChange={(event) =>
                setHealAmount(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm"
              aria-label="Pontos de cura das Mãos Consagradas"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={action.isPending || poolRemaining < healAmount}
              title="Ação: gasta pontos da reserva para curar"
              onClick={() => run("lay-on-hands", healAmount)}
            >
              Curar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={action.isPending || poolRemaining < 5}
              title="Ação: gasta 5 pontos para curar veneno ou doença"
              onClick={() => run("cure-poison")}
            >
              Curar Veneno (5)
            </Button>
          </div>
        </div>
      ) : null}

      <CombatPanelActionButtons
        actions={channelActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        variant="outline"
        onAction={(slug) => run(slug)}
        listTitle="Canalizar"
        listDefaultOpen
      />

      <CombatPanelActionButtons
        actions={subclassActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        variant="outline"
        onAction={(slug) => run(slug)}
        listTitle="Juramento"
      />

      {protectiveSmite ? (
        <div className="rounded-md border border-border/60 bg-muted/20 px-2.5 py-2">
          {economyActionDetailText(protectiveSmite) ? (
            <FeatureDetailTrigger
              variant="text"
              title={protectiveSmite.name}
              subtitle={protectiveSmite.summary}
              description={economyActionDetailText(protectiveSmite)}
            >
              <span className="text-sm font-medium text-foreground underline-offset-2 hover:underline">
                {protectiveSmite.name}
              </span>
              {protectiveSmite.summary ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {protectiveSmite.summary}
                </span>
              ) : null}
            </FeatureDetailTrigger>
          ) : (
            <p className="text-sm font-medium text-foreground">
              {protectiveSmite.name}
            </p>
          )}
        </div>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  return (
    <CombatClassPanelShell
      title="Combate do Paladino"
      actionsContent={actionsContent}
      combatNotes={combatNotes}
    />
  );
}
