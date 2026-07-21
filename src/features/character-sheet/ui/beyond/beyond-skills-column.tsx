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

type SkillRowData = {
  skill: SkillSummary;
  abilityKey: keyof AbilityScores;
  isProficient: boolean;
  bonus: number;
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

  const withBonus: SkillRowData[] = skills.map((skill) => {
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

  const rows = [...proficientRows, ...otherRows];

  return (
    <BeyondPanel
      title="Perícias"
      className="h-full min-w-0"
      headerRight={
        onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
          >
            Editar
          </button>
        ) : null
      }
      flush
    >
      <ul
        className={cn(
          "h-full min-h-0 overflow-y-auto overscroll-contain pb-1",
          "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-track]:bg-transparent",
        )}
      >
        {rows.map((row, index) => {
          const showDivider =
            index === proficientRows.length &&
            proficientRows.length > 0 &&
            otherRows.length > 0;

          return (
            <li key={row.skill.slug}>
              {showDivider ? (
                <div
                  className="mx-3 my-1 border-t border-border/50"
                  aria-hidden
                />
              ) : null}
              <SkillRow {...row} />
            </li>
          );
        })}
      </ul>
    </BeyondPanel>
  );
}

function SkillRow({
  skill,
  abilityKey,
  isProficient,
  bonus,
}: SkillRowData) {
  const abilityLabel =
    ABILITY_SHORT[abilityKey] ??
    ABILITY_LABELS_PT[abilityKey]?.slice(0, 3) ??
    "—";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_2.25rem_minmax(0,1fr)_2.5rem] items-baseline gap-x-2 px-3 py-1.5 text-sm",
        "hover:bg-muted/30",
        isProficient && "bg-primary/[0.07]",
      )}
      title={`${skill.name} (${ABILITY_LABELS_PT[abilityKey]})`}
    >
      <span
        className={cn(
          "mt-0.5 size-1.5 shrink-0 self-center rounded-full",
          isProficient ? "bg-primary" : "bg-border",
        )}
        aria-label={isProficient ? "Proficiente" : undefined}
        aria-hidden={!isProficient}
      />

      <span
        className="self-center font-mono text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase"
        title={ABILITY_LABELS_PT[abilityKey]}
      >
        {abilityLabel}
      </span>

      <span
        className={cn(
          "min-w-0 leading-snug break-words",
          isProficient ? "font-medium text-foreground" : "text-foreground/80",
        )}
      >
        {skill.name}
      </span>

      <span
        className={cn(
          "self-center text-right font-mono text-sm font-semibold tabular-nums",
          isProficient ? "text-primary" : "text-foreground",
        )}
      >
        {formatSkillBonus(bonus)}
      </span>
    </div>
  );
}
