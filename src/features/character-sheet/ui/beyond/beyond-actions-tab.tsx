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
import { formatSkillBonus } from "@/entities/character";
import {
  SheetEmptyHint,
  SheetSectionHeader,
  SheetSubheader,
} from "@/features/character-sheet/ui/sheet-ui";
import { cn } from "@/shared/lib/utils";

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
              <li
                key={`${attack.itemSlug}-${attack.mode}`}
                className="flex gap-3 rounded-lg border border-border/70 bg-card/60 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-secondary/35 bg-secondary/10 text-secondary",
                  )}
                  aria-hidden
                >
                  <CubeIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-heading text-sm font-semibold tracking-tight">
                      {attack.itemName}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {attack.mode === "ranged"
                          ? "à distância"
                          : "corpo a corpo"}
                        {attack.role === "light_bonus"
                          ? " · adicional (Leve)"
                          : null}
                        {attack.role === "dual_bonus"
                          ? " · adicional (Ambidestro)"
                          : null}
                      </span>
                    </p>
                    <p
                      className={cn(
                        "rounded-md border px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
                        attack.attackDisadvantage
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-primary/30 bg-primary/8 text-primary",
                      )}
                    >
                      {formatSkillBonus(attack.attackBonus)}
                      {attack.attackDisadvantage ? " desv." : null}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {attack.damageNote}
                    {attack.damageType ? ` ${attack.damageType}` : ""}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground/90">
                    {attack.attackNote}
                    {attack.proficient ? "" : " · sem proficiência"}
                  </p>
                </div>
              </li>
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
