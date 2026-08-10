"use client";

import {
  BoltIcon,
  ClockIcon,
  CubeIcon,
  HandRaisedIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  useMemo,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CharacterDetail } from "@/entities/character/types";
import {
  fireChamber,
  reloadFirearm,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useEconomyTableAction } from "@/features/character/character-sheet/api/use-economy-table-action";
import {
  useCharacterState,
  useRecoverClassResource,
  useSpendClassResource,
} from "@/features/character/character-sheet/api/use-character-state";
import { useCharacterInventory } from "@/features/character/character-sheet/api/use-character-inventory";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { collectActiveItemSlugs } from "@/features/character/character-sheet/lib/combat/active-item-slugs";
import {
  groupClassEconomyActions,
  resolveClassEconomyActions,
  economyActionDetailText,
  type ActionEconomyBucket,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";
import {
  hasAvailableFreeEconomyUse,
  planEconomyTableUse,
} from "@/features/character/character-sheet/lib/combat/plan-economy-table-use";
import { ClassCombatPanel } from "@/features/character/character-sheet/ui/beyond/combat/class-combat-panel";
import { WeaponAttackCard } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack-card";
import { FeatureDetailTrigger } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import {
  SheetEmptyHint,
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

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

/** Ataques, economia com Usar, ferramentas de classe e passivas. */
export function BeyondActionsTab({ character }: BeyondActionsTabProps) {
  const attacks = character.weaponAttacks ?? [];
  const stateQuery = useCharacterState(character.id);
  const inventoryQuery = useCharacterInventory(character.id);
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${character.id}`,
  );
  const queryClient = useQueryClient();
  const chambers = stateQuery.data?.firearmChambers ?? {};
  const [tableNote, setTableNote] = useState<string | null>(null);
  const [repeatWithPsi, setRepeatWithPsi] = useState(false);
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug: character.classSlug, subclassSlug: character.subclassSlug });

  const activeItemSlugs = useMemo(
    () =>
      collectActiveItemSlugs({
        inventoryItems: inventoryQuery.data?.items,
        weaponAttacks: attacks,
      }),
    [inventoryQuery.data?.items, attacks],
  );

  const economyActions = useMemo(
    () => {
      const resolved = resolveClassEconomyActions(
        mechanicalCatalog.data?.economyActions ?? [],
        {
          classSlug: character.classSlug,
          level: character.level,
          subclassSlug: character.subclassSlug,
          speciesSlug: character.speciesSlug,
          speciesChoices: character.speciesChoices,
          featSlugs: [
            ...(character.characterFeats?.map((feat) => feat.featSlug) ?? []),
            ...(character.subclassOptions ?? [])
              .filter(
                (option) =>
                  option.optionKey === "fighting_style" ||
                  option.optionKey === "additionalFightingStyle" ||
                  option.optionKey.endsWith("FightingStyle"),
              )
              .map((option) => option.valueId),
          ],
          activeItemSlugs,
        },
      );
      const items = inventoryQuery.data?.items ?? [];
      return resolved
        .map((action) => {
          if (action.spellSlug) return action;
          if (
            action.itemSlug === "arma-magificada" ||
            action.itemSlug === "armadura-magificada"
          ) {
            const bound = items.find(
              (item) =>
                item.location === "equipped" &&
                item.attachedCoverageSlug === action.itemSlug &&
                item.attachedCoverageSpellSlug,
            );
            if (!bound?.attachedCoverageSpellSlug) return null;
            return {
              ...action,
              spellSlug: bound.attachedCoverageSpellSlug,
            };
          }
          if (action.itemSlug === "cajado-magificado") {
            const staff = items.find(
              (item) =>
                item.itemSlug === "cajado-magificado" &&
                item.location === "equipped" &&
                item.boundSpellSlug &&
                (item.attuned || !item.requiresAttunement),
            );
            if (!staff?.boundSpellSlug) return null;
            return { ...action, spellSlug: staff.boundSpellSlug };
          }
          return action;
        })
        .filter((action): action is NonNullable<typeof action> => action != null);
    },
    [
      mechanicalCatalog.data?.economyActions,
      character.classSlug,
      character.level,
      character.subclassSlug,
      character.speciesSlug,
      character.speciesChoices,
      character.characterFeats,
      character.subclassOptions,
      activeItemSlugs,
      inventoryQuery.data?.items,
    ],
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

  const spendResource = useSpendClassResource(character.id);
  const recoverResource = useRecoverClassResource(character.id);
  const tableAction = useEconomyTableAction(character.id);
  const resourceBusy =
    spendResource.isPending ||
    recoverResource.isPending ||
    tableAction.isPending;

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

  const showForcePsiSpend =
    character.subclassSlug === "psi-warrior" &&
    character.level >= 3 &&
    hasAvailableFreeEconomyUse(economyActions, remainingBySlug);

  const visibleEconomySections = ECONOMY_SECTIONS.filter(
    (section) => grouped[section.bucket].length > 0,
  );

  const resourceError =
    (spendResource.isError && spendResource.error) ||
    (recoverResource.isError && recoverResource.error) ||
    (tableAction.isError && tableAction.error) ||
    null;

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
                  await spendResource.mutateAsync({
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
                onPsiStrikeResolved={invalidateState}
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
                        bestialAspectLevel:
                          stateQuery.data?.bestialAspectLevel ?? 0,
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

      <ClassCombatPanel
        characterId={character.id}
        character={character}
        state={stateQuery.data}
        onTableNote={setTableNote}
      />

      {visibleEconomySections.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SheetSectionHeader
              title="Economia de Ação"
              icon={BoltIcon}
              count={economyActions.length}
            />
            {showForcePsiSpend ? (
              <label className="text-[0.7rem] text-muted-foreground">
                <input
                  className="mr-1 align-middle"
                  type="checkbox"
                  checked={repeatWithPsi}
                  onChange={(event) => setRepeatWithPsi(event.target.checked)}
                />
                gastar dado psi (em vez do uso gratuito)
              </label>
            ) : null}
          </div>
          {visibleEconomySections.map((section) => (
            <EconomyBucketSection
              key={section.bucket}
              title={section.title}
              badgeColor={section.badgeColor}
              icon={section.icon}
              bucket={section.bucket}
              actions={grouped[section.bucket]}
              remainingBySlug={remainingBySlug}
              busy={resourceBusy}
              preferSpendPool={repeatWithPsi}
              missileShieldArmed={stateQuery.data?.missileShieldArmed ?? false}
              gigaMissileArmed={stateQuery.data?.gigaMissileArmed ?? false}
              onSpend={(resourceSlug) =>
                spendResource.mutate({ resourceSlug, amount: 1 })
              }
              onRecover={(resourceSlug) =>
                recoverResource.mutate({ resourceSlug, amount: 1 })
              }
              onUse={(action, plan) => {
                if (!action.tableAction) return;
                if (!plan.canUse) return;
                tableAction.mutate(
                  {
                    tableAction: action.tableAction,
                    classSlug: action.classSlug,
                    usePsiDie: plan.usePsiDie,
                    resourceSlug: action.resourceSlug,
                    spendAmount: action.spendAmount ?? 1,
                    spellSlug: action.spellSlug,
                    itemSlug: action.itemSlug,
                    note: action.description ?? action.summary,
                    armed: plan.armed,
                  },
                  {
                    onSuccess: (result) => {
                      if (result?.note) setTableNote(result.note);
                    },
                  },
                );
              }}
            />
          ))}
          {tableNote ? (
            <p className="text-sm text-secondary" role="status">
              {tableNote}
            </p>
          ) : null}
          {resourceError ? (
            <p className="text-sm text-destructive" role="alert">
              {resourceError instanceof Error
                ? resourceError.message
                : "Não foi possível atualizar o recurso"}
            </p>
          ) : null}
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
  busy,
  preferSpendPool,
  missileShieldArmed,
  gigaMissileArmed,
  onSpend,
  onRecover,
  onUse,
}: {
  bucket: ActionEconomyBucket;
  title: string;
  badgeColor: string;
  icon: HeroIcon;
  actions: ClassEconomyAction[];
  remainingBySlug: Map<string, { remaining: number; max: number }>;
  busy: boolean;
  preferSpendPool: boolean;
  missileShieldArmed: boolean;
  gigaMissileArmed: boolean;
  onSpend: (resourceSlug: string) => void;
  onRecover: (resourceSlug: string) => void;
  onUse: (
    action: ClassEconomyAction,
    plan: ReturnType<typeof planEconomyTableUse>,
  ) => void;
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
          const plan = planEconomyTableUse({
            action,
            remainingBySlug,
            preferSpendPool,
            missileShieldArmed,
            gigaMissileArmed,
          });
          const counter =
            plan.counterSlug != null
              ? remainingBySlug.get(plan.counterSlug)
              : undefined;
          const canSpend = Boolean(
            plan.counterSlug && counter && counter.remaining > 0,
          );
          const canRecover = Boolean(
            plan.counterSlug &&
              counter &&
              counter.remaining < counter.max,
          );
          const detailText = economyActionDetailText(action);
          const economyLabel =
            action.economy === "bonus"
              ? "Ação Bônus"
              : action.economy === "reaction"
                ? "Reação"
                : action.economy === "free"
                  ? "Sem ação / especial"
                  : "Ação";

          return (
            <li
              key={action.id}
              className="flex items-start justify-between gap-3 px-2.5 py-2"
            >
              <div className="min-w-0 flex-1">
                {detailText ? (
                  <FeatureDetailTrigger
                    variant="text"
                    title={action.name}
                    subtitle={economyLabel}
                    description={detailText}
                  >
                    <span className="text-sm font-medium text-foreground underline-offset-2 hover:underline">
                      {action.name}
                    </span>
                    {action.summary ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {action.summary}
                      </span>
                    ) : null}
                    {plan.hint ? (
                      <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground/90">
                        {plan.hint}
                      </span>
                    ) : null}
                  </FeatureDetailTrigger>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {action.name}
                    </p>
                    {action.summary ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {action.summary}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                {action.tableAction ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={busy || !plan.canUse}
                    title={plan.buttonLabel}
                    onClick={() => onUse(action, plan)}
                  >
                    {plan.buttonLabel}
                  </Button>
                ) : null}
                {counter && plan.counterSlug ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      className="size-7 p-0"
                      disabled={!canSpend || busy}
                      aria-label={`Gastar uso de ${action.name}`}
                      title="Gastar 1 uso (ajuste manual)"
                      onClick={() => onSpend(plan.counterSlug!)}
                    >
                      <MinusIcon className="size-3.5" aria-hidden />
                    </Button>
                    <span
                      className={cn(
                        "min-w-[2.75rem] text-center font-mono text-xs tabular-nums",
                        counter.remaining <= 0
                          ? "text-muted-foreground/70"
                          : "text-foreground",
                      )}
                    >
                      {counter.remaining}/{counter.max}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="size-7 p-0"
                      disabled={!canRecover || busy}
                      aria-label={`Recuperar uso de ${action.name}`}
                      title="Recuperar 1 uso"
                      onClick={() => onRecover(plan.counterSlug!)}
                    >
                      <PlusIcon className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
