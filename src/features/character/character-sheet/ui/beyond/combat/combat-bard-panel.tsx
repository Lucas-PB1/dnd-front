"use client";

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

export function CombatBardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatBardPanelProps) {
  const action = useTableActionMutation(characterId, executeBardTableAction);

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
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
              {spendsInspiration ? ` (${remaining})` : ""}
            </Button>
          );
        })}
      </div>
    );
  }

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
    subclassActions.length > 0 ? (
      <div className="space-y-2">
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
