"use client";

import {
  BoltIcon,
  ClockIcon,
  CubeIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { WeaponAttackCard } from "@/features/character-sheet/ui/beyond/weapon-attack-card";
import {
  SheetEmptyHint,
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character-sheet/ui/sheet-ui";

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
