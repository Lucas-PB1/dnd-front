"use client";

import {
  BoltIcon,
  ClockIcon,
  CubeIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useMemo, type ComponentType, type SVGProps } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CharacterDetail } from "@/entities/character/types";
import {
  fireChamber,
  reloadFirearm,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import {
  useCharacterState,
  useSpendClassResource,
} from "@/features/character/character-sheet/api/use-character-state";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import {
  groupClassEconomyActions,
  resolveClassEconomyActions,
  type ActionEconomyBucket,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { WeaponAttackCard } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack-card";
import {
  SheetEmptyHint,
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";

type BeyondActionsTabProps = {
  character: CharacterDetail;
};

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ECONOMY_SECTIONS: {
  bucket: ActionEconomyBucket;
  title: string;
  badgeColor: string;
  icon: HeroIcon;
}[] = [
  {
    bucket: "action",
    title: "Ação",
    badgeColor: "border-chart-1/30 bg-chart-1/15 text-chart-1",
    icon: BoltIcon,
  },
  {
    bucket: "bonus",
    title: "Ação Bônus",
    badgeColor: "border-chart-2/30 bg-chart-2/15 text-chart-2",
    icon: SparklesIcon,
  },
  {
    bucket: "reaction",
    title: "Reação",
    badgeColor: "border-chart-4/30 bg-chart-4/15 text-chart-4",
    icon: HandRaisedIcon,
  },
  {
    bucket: "free",
    title: "Sem ação / especial",
    badgeColor: "border-chart-3/30 bg-chart-3/15 text-chart-3",
    icon: ClockIcon,
  },
];

/** Ataques com arma + features de classe por economia de ação. */
export function BeyondActionsTab({ character }: BeyondActionsTabProps) {
  const attacks = character.weaponAttacks ?? [];
  const stateQuery = useCharacterState(character.id);
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${character.id}`,
  );
  const queryClient = useQueryClient();
  const chambers = stateQuery.data?.firearmChambers ?? {};

  const economyActions = useMemo(
    () =>
      resolveClassEconomyActions({
        classSlug: character.classSlug,
        level: character.level,
        subclassSlug: character.subclassSlug,
      }),
    [character.classSlug, character.level, character.subclassSlug],
  );
  const grouped = useMemo(
    () => groupClassEconomyActions(economyActions),
    [economyActions],
  );

  const invalidateState = () => {
    void queryClient.invalidateQueries({
      queryKey: sessionKeys.state(character.id),
    });
  };

  const smiteSlots =
    character.classSlug === "paladin"
      ? Object.entries(stateQuery.data?.spellSlotsRemaining ?? {})
          .map(([level, remaining]) => ({
            level: Number(level),
            remaining: Number(remaining),
          }))
          .filter((slot) => slot.level >= 1 && slot.remaining > 0)
          .sort((a, b) => a.level - b.level)
      : [];

  const spendRisk = useSpendClassResource(character.id);

  const reload = useMutation({
    mutationFn: async (itemSlug: string) => {
      try {
        return await reloadFirearm(requireToken(), character.id, itemSlug);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidateState,
  });

  const fire = useMutation({
    mutationFn: async ({
      itemSlug,
      shots,
    }: {
      itemSlug: string;
      shots?: number;
    }) => {
      try {
        return await fireChamber(requireToken(), character.id, itemSlug, shots);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidateState,
  });

  const remainingBySlug = useMemo(() => {
    const map = new Map<string, { remaining: number; max: number }>();
    for (const resource of stateQuery.data?.classResources ?? []) {
      map.set(resource.slug, {
        remaining: resource.remaining,
        max: resource.max,
      });
    }
    return map;
  }, [stateQuery.data?.classResources]);

  const visibleEconomySections = ECONOMY_SECTIONS.filter(
    (section) => grouped[section.bucket].length > 0,
  );

  return (
    <div className="space-y-5">
      <section className="space-y-2" aria-labelledby="weapon-attacks">
        <SheetSectionHeader
          id="weapon-attacks"
          title="Ataques com Arma"
          count={attacks.length}
          icon={CubeIcon}
        />
        {attacks.length === 0 ? (
          <SheetEmptyHint>
            Equipe uma arma na mão principal ou secundária para ver o bônus.
          </SheetEmptyHint>
        ) : (
          <ul className="space-y-2">
            {attacks.map((attack) => (
              <WeaponAttackCard
                key={`${attack.itemSlug}-${attack.mode}-${attack.role ?? "main"}`}
                attack={attack}
                chamberRemaining={
                  attack.reloadCapacity != null
                    ? (chambers[attack.itemSlug] ?? attack.reloadCapacity)
                    : null
                }
                onReload={(itemSlug) => reload.mutate(itemSlug)}
                onFire={(itemSlug, shots) => fire.mutate({ itemSlug, shots })}
                onHeadShot={async () => {
                  await spendRisk.mutateAsync({
                    resourceSlug: "risk",
                    amount: 3,
                  });
                }}
                canHeadShot={
                  character.classSlug === "gunslinger" &&
                  character.level >= 20 &&
                  attack.mode === "ranged"
                }
                canStudiedAttack={
                  character.classSlug === "fighter" && character.level >= 13
                }
                canDoorKick={
                  character.subclassSlug === "dungeoneer" &&
                  character.level >= 3
                }
                canPsiStrike={
                  character.subclassSlug === "psi-warrior" &&
                  character.level >= 3
                }
                canMonsterSlayer={
                  character.subclassSlug === "dungeoneer" &&
                  character.level >= 10
                }
                onSpendPsi={async () => {
                  await spendRisk.mutateAsync({
                    resourceSlug: "psi-energy-dice",
                    amount: 1,
                  });
                }}
                rogue={
                  character.classSlug === "rogue"
                    ? {
                        level: character.level,
                        subclassSlug: character.subclassSlug,
                      }
                    : undefined
                }
                paladin={
                  character.classSlug === "paladin"
                    ? { smiteSlots }
                    : undefined
                }
                onDivineSmiteResolved={invalidateState}
                ranger={
                  character.classSlug === "ranger"
                    ? {
                        level: character.level,
                        subclassSlug: character.subclassSlug,
                      }
                    : undefined
                }
                onDreadAmbusherResolved={invalidateState}
                cleric={
                  character.classSlug === "cleric"
                    ? { level: character.level }
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </section>

      {visibleEconomySections.length > 0 ? (
        <div className="space-y-3">
          <SheetSectionHeader
            title="Economia de Ação"
            icon={BoltIcon}
            count={economyActions.length}
          />
          {visibleEconomySections.map((section) => (
            <EconomyBucketSection
              key={section.bucket}
              title={section.title}
              badgeColor={section.badgeColor}
              icon={section.icon}
              bucket={section.bucket}
              actions={grouped[section.bucket]}
              remainingBySlug={remainingBySlug}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EconomyBucketSection({
  bucket,
  title,
  badgeColor,
  icon: Icon,
  actions,
  remainingBySlug,
}: {
  bucket: ActionEconomyBucket;
  title: string;
  badgeColor: string;
  icon: HeroIcon;
  actions: ClassEconomyAction[];
  remainingBySlug: Map<string, { remaining: number; max: number }>;
}) {
  return (
    <section
      className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-3"
      aria-labelledby={`economy-${bucket}`}
    >
      <div className="flex items-center justify-between gap-2">
        <SheetSubheader
          id={`economy-${bucket}`}
          title={title}
          count={actions.length}
          icon={Icon}
        />
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${badgeColor}`}
        >
          {title}
        </span>
      </div>
      <ul className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/60 bg-background/40">
        {actions.map((action) => {
          const resource =
            action.resourceSlug != null
              ? remainingBySlug.get(action.resourceSlug)
              : undefined;
          return (
            <li
              key={action.id}
              className="flex items-start justify-between gap-3 px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {action.name}
                </p>
                {action.summary ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.summary}
                  </p>
                ) : null}
              </div>
              {resource ? (
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {resource.remaining}/{resource.max}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
