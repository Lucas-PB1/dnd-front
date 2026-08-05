"use client";

import {
  BoltIcon,
  ClockIcon,
  CubeIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useState, type ComponentType, type SVGProps } from "react";
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
import { WeaponAttackCard } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack-card";
import {
  SheetEmptyHint,
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";

type BeyondActionsTabProps = {
  character: CharacterDetail;
};

type ActionEconomyBucket = "action" | "bonus" | "reaction" | "free";
type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const SECTIONS: {
  bucket: ActionEconomyBucket;
  title: string;
  badgeColor: string;
  emptyMessage: string;
  icon: HeroIcon;
}[] = [
  {
    bucket: "action",
    title: "Ação",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    emptyMessage: "Nenhuma ação catalogada ainda.",
    icon: BoltIcon,
  },
  {
    bucket: "bonus",
    title: "Ação Bônus",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    emptyMessage: "Nenhuma ação bônus catalogada.",
    icon: SparklesIcon,
  },
  {
    bucket: "reaction",
    title: "Reação",
    badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    emptyMessage: "Nenhuma reação catalogada.",
    icon: HandRaisedIcon,
  },
  {
    bucket: "free",
    title: "Ação Livre",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    emptyMessage: "Nenhuma ação livre catalogada.",
    icon: ClockIcon,
  },
];

/** Economia de ação na mesa — ataques de arma vêm da ficha (`weaponAttacks`). */
export function BeyondActionsTab({ character }: BeyondActionsTabProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | ActionEconomyBucket>(
    "all",
  );
  const attacks = character.weaponAttacks ?? [];
  const stateQuery = useCharacterState(character.id);
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${character.id}`,
  );
  const queryClient = useQueryClient();
  const chambers = stateQuery.data?.firearmChambers ?? {};

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

  const filteredSections = SECTIONS.filter(
    (section) => activeFilter === "all" || section.bucket === activeFilter,
  );

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Rápidos por Economia de Ação */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 p-2 backdrop-blur-md">
        <span className="px-2 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
          Filtrar Ações:
        </span>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Todos
        </button>
        {SECTIONS.map((sec) => (
          <button
            key={sec.bucket}
            type="button"
            onClick={() => setActiveFilter(sec.bucket)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${
              activeFilter === sec.bucket
                ? `${sec.badgeColor} shadow-sm font-semibold`
                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <sec.icon className="size-3.5" aria-hidden />
            {sec.title}
          </button>
        ))}
      </div>

      {(activeFilter === "all" || activeFilter === "action") && (
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
                    character.classSlug === "paladin" ? { smiteSlots } : undefined
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
      )}

      <div className="space-y-4">
        <SheetSectionHeader title="Economia de Ação na Mesa" icon={BoltIcon} />
        {filteredSections.map((section) => (
          <ActionEconomySection key={section.bucket} {...section} />
        ))}
      </div>
    </div>
  );
}

function ActionEconomySection({
  bucket,
  title,
  badgeColor,
  emptyMessage,
  icon: Icon,
}: {
  bucket: ActionEconomyBucket;
  title: string;
  badgeColor: string;
  emptyMessage: string;
  icon: HeroIcon;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-3 backdrop-blur-sm" aria-labelledby={`actions-${bucket}`}>
      <div className="flex items-center justify-between">
        <SheetSubheader
          id={`actions-${bucket}`}
          title={title}
          count={0}
          icon={Icon}
        />
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${badgeColor}`}>
          {title}
        </span>
      </div>
      <SheetEmptyHint className="py-2.5">{emptyMessage}</SheetEmptyHint>
    </section>
  );
}
