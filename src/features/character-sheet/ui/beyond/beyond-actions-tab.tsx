"use client";

import type { CharacterDetail } from "@/entities/character/types";
import { formatSkillBonus } from "@/entities/character";

type BeyondActionsTabProps = {
  character: CharacterDetail;
};

type ActionEconomyBucket = "action" | "bonus" | "reaction" | "free";

const SECTIONS: {
  bucket: ActionEconomyBucket;
  title: string;
  emptyMessage: string;
}[] = [
  {
    bucket: "action",
    title: "Ação",
    emptyMessage: "Nenhuma ação catalogada ainda.",
  },
  {
    bucket: "bonus",
    title: "Ação Bônus",
    emptyMessage: "Nenhuma ação bônus catalogada.",
  },
  {
    bucket: "reaction",
    title: "Reação",
    emptyMessage: "Nenhuma reação catalogada.",
  },
  {
    bucket: "free",
    title: "Ação Livre",
    emptyMessage: "Nenhuma ação livre catalogada.",
  },
];

/** Economia de ação na mesa — ataques de arma vêm da ficha (`weaponAttacks`). */
export function BeyondActionsTab({ character }: BeyondActionsTabProps) {
  const attacks = character.weaponAttacks ?? [];

  return (
    <div className="space-y-4">
      <section className="space-y-2" aria-labelledby="weapon-attacks">
        <div className="flex items-center gap-2">
          <h3
            id="weapon-attacks"
            className="text-sm font-semibold tracking-tight"
          >
            Ataques com arma
            <span className="ml-1.5 font-mono text-[0.7rem] tabular-nums text-muted-foreground">
              ({attacks.length})
            </span>
          </h3>
          <span className="h-px flex-1 bg-border/50" aria-hidden />
        </div>
        {attacks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Equipe uma arma na mão principal ou secundária para ver o bônus.
          </p>
        ) : (
          <ul className="space-y-2">
            {attacks.map((attack) => (
              <li
                key={`${attack.itemSlug}-${attack.mode}`}
                className="rounded-lg border border-border/70 bg-card/60 px-3 py-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {attack.itemName}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {attack.mode === "ranged"
                        ? "à distância"
                        : "corpo a corpo"}
                    </span>
                  </p>
                  <p className="font-mono text-sm tabular-nums">
                    {formatSkillBonus(attack.attackBonus)} para acertar
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {attack.damageNote}
                  {attack.damageType ? ` ${attack.damageType}` : ""}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-muted-foreground/90">
                  {attack.attackNote}
                  {attack.proficient ? "" : " · sem proficiência"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h3 className="text-sm font-semibold tracking-tight">Ações</h3>
      <div className="space-y-4">
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
}: {
  bucket: ActionEconomyBucket;
  title: string;
  emptyMessage: string;
}) {
  return (
    <section className="space-y-1.5" aria-labelledby={`actions-${bucket}`}>
      <div className="flex items-center gap-2">
        <h4
          id={`actions-${bucket}`}
          className="text-[0.7rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
        >
          {title}
          <span className="ml-1.5 font-mono tabular-nums text-muted-foreground/80">
            (0)
          </span>
        </h4>
        <span className="h-px flex-1 bg-border/50" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    </section>
  );
}
