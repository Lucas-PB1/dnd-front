"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeClericTableAction,
  type ClericTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatClericPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type ClericAction = {
  slug: ClericTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const CLERIC_ACTIONS: readonly ClericAction[] = [
  {
    slug: "divine-spark-heal",
    label: "Centelha: Cura",
    minLevel: 2,
    resourceSlug: "channelDivinity",
  },
  {
    slug: "divine-spark-damage",
    label: "Centelha: Dano",
    minLevel: 2,
    resourceSlug: "channelDivinity",
  },
  {
    slug: "turn-undead",
    label: "Expulsar Mortos-Vivos",
    minLevel: 2,
    resourceSlug: "channelDivinity",
  },
  {
    slug: "divine-intervention",
    label: "Intervenção Divina",
    minLevel: 10,
    resourceSlug: "divineIntervention",
  },
  {
    slug: "preserve-life",
    label: "Preservar a Vida",
    minLevel: 3,
    subclass: "life",
    resourceSlug: "channelDivinity",
  },
  {
    slug: "radiance-of-dawn",
    label: "Brilho do Amanhecer",
    minLevel: 3,
    subclass: "light",
    resourceSlug: "channelDivinity",
  },
  {
    slug: "warding-flare",
    label: "Labareda Protetora",
    minLevel: 3,
    subclass: "light",
    resourceSlug: "warding-flare",
  },
  {
    slug: "crown-of-light",
    label: "Coroa de Luz",
    minLevel: 17,
    subclass: "light",
    resourceSlug: "corona-of-light",
  },
  {
    slug: "tricksters-blessing",
    label: "Bênção do Trapaceiro",
    minLevel: 3,
    subclass: "trickery",
  },
  {
    slug: "invoke-duplicity",
    label: "Invocar Duplicidade",
    minLevel: 3,
    subclass: "trickery",
    resourceSlug: "channelDivinity",
  },
  {
    slug: "guided-strike",
    label: "Ataque Direcionado +10",
    minLevel: 3,
    subclass: "war",
    resourceSlug: "channelDivinity",
  },
  {
    slug: "war-priest",
    label: "Sacerdote da Guerra",
    minLevel: 3,
    subclass: "war",
    resourceSlug: "war-priest",
  },
  {
    slug: "war-gods-blessing",
    label: "Bênção do Deus da Guerra",
    minLevel: 6,
    subclass: "war",
    resourceSlug: "channelDivinity",
  },
];

const CLERIC_RESOURCE_SLUGS = [
  "channelDivinity",
  "divineIntervention",
  "warding-flare",
  "corona-of-light",
  "war-priest",
] as const;

export function CombatClericPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatClericPanelProps) {
  const action = useTableActionMutation(characterId, executeClericTableAction);

  if (classSlug !== "cleric") return null;

  const resources = state?.classResources ?? [];
  const availableActions = CLERIC_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Clérigo
      </p>

      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
        {CLERIC_RESOURCE_SLUGS.map((slug) => {
          const resource = resources.find((item) => item.slug === slug);
          if (!resource) return null;
          return (
            <p key={slug}>
              {resource.name}:{" "}
              <span className="font-semibold text-foreground">
                {resource.remaining}/{resource.max}
              </span>
            </p>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {availableActions.map((item) => {
          const resource = item.resourceSlug
            ? resources.find((entry) => entry.slug === item.resourceSlug)
            : undefined;
          return (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.resourceSlug ? "outline" : "ghost"}
              disabled={
                action.isPending ||
                (resource != null && resource.remaining <= 0)
              }
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

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
