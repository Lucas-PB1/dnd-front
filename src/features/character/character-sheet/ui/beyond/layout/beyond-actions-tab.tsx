"use client";

import {
  BoltIcon,
  ClockIcon,
  CubeIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
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
  emptyMessage: string;
  icon: HeroIcon;
}[] = [
  {
    bucket: "action",
    title: "Ação",
    emptyMessage: "Nenhuma ação catalogada ainda.",
    icon: BoltIcon,
  },
  {
    bucket: "bonus",
    title: "Ação Bônus",
    emptyMessage: "Nenhuma ação bônus catalogada.",
    icon: SparklesIcon,
  },
  {
    bucket: "reaction",
    title: "Reação",
    emptyMessage: "Nenhuma reação catalogada.",
    icon: HandRaisedIcon,
  },
  {
    bucket: "free",
    title: "Ação Livre",
    emptyMessage: "Nenhuma ação livre catalogada.",
    icon: ClockIcon,
  },
];

/** Economia de ação na mesa — ataques de arma vêm da ficha (`weaponAttacks`). */
export function BeyondActionsTab({ character }: BeyondActionsTabProps) {
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
        return await fireChamber(
          requireToken(),
          character.id,
          itemSlug,
          shots,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: invalidateState,
  });

  return (
    <div className="space-y-5">
      <section className="space-y-2" aria-labelledby="weapon-attacks">
        <SheetSectionHeader
          id="weapon-attacks"
          title="Ataques com arma"
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
                onFire={(itemSlug, shots) =>
                  fire.mutate({ itemSlug, shots })
                }
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
              />
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-4">
        <SheetSectionHeader title="Ações" icon={BoltIcon} />
        {SECTIONS.map((section) => (
          <ActionEconomySection key={section.bucket} {...section} />
        ))}
      </div>
    </div>
  );
}

function ActionEconomySection({
  bucket,
  title,
  emptyMessage,
  icon,
}: {
  bucket: ActionEconomyBucket;
  title: string;
  emptyMessage: string;
  icon: HeroIcon;
}) {
  return (
    <section className="space-y-1.5" aria-labelledby={`actions-${bucket}`}>
      <SheetSubheader
        id={`actions-${bucket}`}
        title={title}
        count={0}
        icon={icon}
      />
      <SheetEmptyHint className="py-3">{emptyMessage}</SheetEmptyHint>
    </section>
  );
}
