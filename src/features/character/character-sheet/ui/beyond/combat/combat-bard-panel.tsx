"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeBardTableAction,
  type BardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { CombatResourceSummary } from "@/features/character/character-sheet/ui/beyond/combat/combat-resource-summary";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatBardPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type BardAction = {
  slug: BardTableActionSlug;
  label: string;
  title: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
  /** Base-class action (Ações) vs subclass (Poderes). */
  kind: "base" | "subclass";
};

const PERSONA_MASK_OPTIONS = [
  { slug: "persona-mask-angel", label: "Anjo" },
  { slug: "persona-mask-archmage", label: "Arquimago" },
  { slug: "persona-mask-devil", label: "Diabo" },
  { slug: "persona-mask-dragon", label: "Dragão" },
  { slug: "persona-mask-faceless", label: "Sem Rosto" },
  { slug: "persona-mask-gladiator", label: "Gladiador" },
  { slug: "persona-mask-hierophant", label: "Hierofante" },
  { slug: "persona-mask-jester", label: "Bufão" },
  { slug: "persona-mask-noble", label: "Nobre" },
] as const;

const BARD_ACTIONS: readonly BardAction[] = [
  {
    slug: "grant-inspiration",
    label: "Conceder Inspiração",
    title: "Ação Bônus: gasta 1 Inspiração Bárdica e concede o dado a um aliado a até 18 m",
    minLevel: 1,
    resourceSlug: "bardicInspiration",
    kind: "base",
  },
  {
    slug: "superior-inspiration",
    label: "Inspiração Superior (+1)",
    title: "Na iniciativa: se estiver sem usos, recupera 1 Inspiração Bárdica (nv. 18+)",
    minLevel: 18,
    kind: "base",
  },
  {
    slug: "cutting-words",
    label: "Palavras Cortantes",
    title: "Reação (Conhecimento): gasta 1 Inspiração e subtrai o dado de ataque/teste/dano inimigo",
    minLevel: 3,
    subclass: "lore",
    resourceSlug: "bardicInspiration",
    kind: "subclass",
  },
  {
    slug: "enthralling-performance",
    label: "Desempenho Cativante",
    title: "Glamour: gasta 1 Inspiração para PV temporários (2×dado) e movimento por Reação",
    minLevel: 3,
    subclass: "glamour",
    resourceSlug: "bardicInspiration",
    kind: "subclass",
  },
  {
    slug: "unarmed-dance",
    label: "Ataque Desarmado (Dança)",
    title: "Dança: ataque desarmado com Carisma + dado de Inspiração (não gasta uso)",
    minLevel: 3,
    subclass: "dance",
    kind: "subclass",
  },
  {
    slug: "agile-response",
    label: "Resposta Ágil",
    title: "Reação (Dança, nv. 6+): gasta 1 Inspiração para +CA e movimento se o ataque errar",
    minLevel: 6,
    subclass: "dance",
    resourceSlug: "bardicInspiration",
    kind: "subclass",
  },
  {
    slug: "combat-inspiration",
    label: "Inspiração de Combate",
    title: "Bravura: o aliado inspirado pode somar o dado ao dano ou à CA (Reação)",
    minLevel: 3,
    subclass: "valor",
    resourceSlug: "bardicInspiration",
    kind: "subclass",
  },
];

function isBardicInspirationSlug(slug: string): boolean {
  return slug === "bardicInspiration" || slug === "bardic-inspiration";
}

function maxEquippedMasks(level: number): number {
  return level >= 14 ? 2 : 1;
}

function maskLabel(slug: string): string {
  return PERSONA_MASK_OPTIONS.find((item) => item.slug === slug)?.label ?? slug;
}

export function CombatBardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatBardPanelProps) {
  const action = useTableActionMutation(characterId, executeBardTableAction);
  const isMasks = subclassSlug === "college-of-masks" && level >= 3;
  const activeMasks = state?.personaMasks ?? [];
  const maxMasks = maxEquippedMasks(level);
  const [draftMasks, setDraftMasks] = useState<string[]>(activeMasks);
  const activeKey = activeMasks.join("|");

  useEffect(() => {
    setDraftMasks(activeMasks);
  }, [activeKey]);

  const activeLabels = useMemo(
    () => activeMasks.map(maskLabel).join(", "),
    [activeKey],
  );

  if (classSlug !== "bard") return null;

  const resources = state?.classResources ?? [];
  const bardicResource = resources.find((item) =>
    isBardicInspirationSlug(item.slug),
  );
  const remaining = bardicResource?.remaining ?? 0;

  const available = BARD_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );
  const baseActions = available.filter((item) => item.kind === "base");
  const subclassActions = available.filter((item) => item.kind === "subclass");

  function toggleDraftMask(slug: string) {
    setDraftMasks((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= maxMasks) {
        return [...current.slice(1), slug];
      }
      return [...current, slug];
    });
  }

  function renderActionButtons(items: readonly BardAction[]) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const spendsInspiration = item.resourceSlug != null;
          return (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={spendsInspiration ? "outline" : "ghost"}
              title={item.title}
              disabled={
                action.isPending ||
                !state ||
                (spendsInspiration && remaining <= 0)
              }
              onClick={() => action.mutate({ actionSlug: item.slug })}
            >
              {item.label}
              {spendsInspiration ? ` (${remaining})` : ""}
            </Button>
          );
        })}
      </div>
    );
  }

  const masksContent = isMasks ? (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      <p className="text-sm text-muted-foreground">
        Máscaras ativas ({activeMasks.length}/{maxMasks}):{" "}
        <span className="font-medium text-foreground">
          {activeLabels || "nenhuma"}
        </span>
      </p>
      <div className="grid gap-1 sm:grid-cols-2">
        {PERSONA_MASK_OPTIONS.map((mask) => {
          const checked = draftMasks.includes(mask.slug);
          return (
            <label
              key={mask.slug}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={action.isPending || !state}
                onChange={() => toggleDraftMask(mask.slug)}
              />
              {mask.label}
            </label>
          );
        })}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={action.isPending || !state}
        title="Ação Bônus: vestir ou trocar máscaras de persona"
        onClick={() =>
          action.mutate({
            actionSlug: "set-persona-masks",
            masks: draftMasks,
          })
        }
      >
        Vestir
      </Button>
    </div>
  ) : null;

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["bardicInspiration", "bardic-inspiration"]}
      />

      {renderActionButtons(baseActions)}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassActions.length > 0 || masksContent ? (
      <div className="space-y-2">
        {masksContent}
        {renderActionButtons(subclassActions)}
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Bardo"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
      actionsIcon="🎵"
    />
  );
}
