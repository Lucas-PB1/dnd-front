"use client";

import type { AbilityScores, CharacterDetail } from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  formatSkillBonus,
  skillBonus,
} from "@/entities/character";
import type { SkillSummary } from "@/entities/skill/types";
import {
  BeyondPanel,
  ABILITY_SHORT,
} from "@/features/character-sheet/ui/beyond/beyond-panel";
import { cn } from "@/shared/lib/utils";

type BeyondSkillsColumnProps = {
  character: CharacterDetail;
  skills: SkillSummary[];
  onEdit?: () => void;
};

export function BeyondSkillsColumn({
  character,
  skills,
  onEdit,
}: BeyondSkillsColumnProps) {
  const proficient = new Set([
    ...character.classSkillSlugs,
    ...character.backgroundSkillSlugs,
  ]);

  const withBonus = skills.map((skill) => {
    const abilityKey = skill.abilitySlug as keyof AbilityScores;
    const score = character.abilityScores[abilityKey] ?? 10;
    const isProficient = proficient.has(skill.slug);
    return {
      skill,
      abilityKey,
      isProficient,
      bonus: skillBonus(score, isProficient, character.proficiencyBonus),
    };
  });

  const proficientRows = withBonus
    .filter((r) => r.isProficient)
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name, "pt"));
  const otherRows = withBonus
    .filter((r) => !r.isProficient)
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name, "pt"));

  return (
    <BeyondPanel
      title="Perícias"
      className="flex h-full min-h-0 flex-col"
      headerRight={
        <div className="flex items-center gap-2">
          {proficientRows.length > 0 ? (
            <span className="text-[0.65rem] tabular-nums text-muted-foreground">
              {proficientRows.length} prof.
            </span>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
            >
              Editar
            </button>
          ) : null}
        </div>
      }
      flush
    >
      <ul
        className={cn(
          "max-h-[min(28rem,55vh)] overflow-y-auto lg:max-h-[calc(100vh-16rem)]",
          "divide-y divide-border/40",
        )}
      >
        {proficientRows.length > 0 ? (
          <li className="sticky top-0 z-[1] bg-muted/80 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Proficientes
            </p>
          </li>
        ) : null}

        {proficientRows.map((row) => (
          <SkillRow key={row.skill.slug} {...row} />
        ))}

        {otherRows.length > 0 && proficientRows.length > 0 ? (
          <li className="sticky top-0 z-[1] bg-muted/80 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Demais
            </p>
          </li>
        ) : null}

        {otherRows.map((row) => (
          <SkillRow key={row.skill.slug} {...row} />
        ))}
      </ul>
    </BeyondPanel>
  );
}

function SkillRow({
  skill,
  abilityKey,
  isProficient,
  bonus,
}: {
  skill: SkillSummary;
  abilityKey: keyof AbilityScores;
  isProficient: boolean;
  bonus: number;
}) {
  const abilityLabel =
    ABILITY_SHORT[abilityKey] ??
    ABILITY_LABELS_PT[abilityKey]?.slice(0, 3) ??
    "—";

  return (
    <li
      className={cn(
        "group flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
        "hover:bg-muted/35",
        isProficient && "bg-primary/[0.06]",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-sm border",
          isProficient
            ? "border-primary/60 bg-primary text-primary-foreground"
            : "border-border/80 bg-transparent",
        )}
        title={isProficient ? "Proficiente" : "Sem proficiência"}
        aria-label={isProficient ? "Proficiente" : "Sem proficiência"}
      >
        {isProficient ? (
          <svg
            viewBox="0 0 12 12"
            className="size-2.5"
            fill="none"
            aria-hidden
          >
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate leading-tight",
          isProficient ? "font-medium text-foreground" : "text-foreground/85",
        )}
      >
        {skill.name}
      </span>

      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wide uppercase",
          "bg-muted/60 text-muted-foreground",
        )}
        title={ABILITY_LABELS_PT[abilityKey]}
      >
        {abilityLabel}
      </span>

      <span
        className={cn(
          "w-9 shrink-0 text-right font-mono text-sm font-semibold tabular-nums",
          isProficient ? "text-primary" : "text-foreground",
        )}
      >
        {formatSkillBonus(bonus)}
      </span>
    </li>
  );
}
