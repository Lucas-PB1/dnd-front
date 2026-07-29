"use client";

import {
  AcademicCapIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import type { AbilityScores, CharacterDetail } from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  formatSkillBonus,
  sheetAbilityScores,
  skillCheckBonus,
  skillProficiencyRank,
  abilityModifierValue,
} from "@/entities/character";
import type { SkillSummary } from "@/entities/skill/types";
import {
  BeyondPanel,
  ABILITY_SHORT,
} from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { SheetEditAction } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
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
  isExpertise: boolean;
  isJack: boolean;
  bonus: number;
};

export function BeyondSkillsColumn({
  character,
  skills,
  onEdit,
}: BeyondSkillsColumnProps) {
  const rolls = useSheetRolls();
  const [useStrokeOfLuck, setUseStrokeOfLuck] = useState(false);
  const scores = sheetAbilityScores(character);
  const skillSources = {
    classSkillSlugs: character.classSkillSlugs,
    backgroundSkillSlugs: character.backgroundSkillSlugs,
    speciesChoices: character.speciesChoices,
    featOptions: character.featOptions,
    classOptions: character.classOptions,
    classSlug: character.classSlug,
    level: character.level,
  };

  const withBonus: SkillRowData[] = skills.map((skill) => {
    const abilityKey = skill.abilitySlug as keyof AbilityScores;
    const score = scores[abilityKey] ?? 10;
    const rank = skillProficiencyRank(skill.slug, skillSources);
    const isProficient = rank === "proficient" || rank === "expertise";
    const isExpertise = rank === "expertise";
    const isJack = rank === "jack";
    return {
      skill,
      abilityKey,
      isProficient,
      isExpertise,
      isJack,
      bonus: skillCheckBonus(
        abilityModifierValue(score),
        character.proficiencyBonus,
        rank,
      ),
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
      icon={AcademicCapIcon}
      className="min-w-0"
      headerRight={
        onEdit ? (
          <SheetEditAction onClick={onEdit}>
            <PencilSquareIcon className="size-3" aria-hidden />
            Editar
          </SheetEditAction>
        ) : null
      }
      flush
    >
      {character.classSlug === "rogue" && character.level >= 20 ? (
        <label className="block border-b border-border/50 px-3 py-1.5 text-[0.68rem] text-muted-foreground">
          <input
            className="mr-1 align-middle"
            type="checkbox"
            checked={useStrokeOfLuck}
            onChange={(event) => setUseStrokeOfLuck(event.target.checked)}
          />
          Golpe de Sorte: transformar falha em 20
        </label>
      ) : null}
      <ul className="pb-1">
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
              <SkillRow
                {...row}
                pending={rolls.skill.isPending}
                onRoll={() => {
                  rolls.skill.mutate({
                    skillSlug: row.skill.slug,
                    strokeOfLuck: useStrokeOfLuck || undefined,
                  });
                  setUseStrokeOfLuck(false);
                }}
              />
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
  isExpertise,
  isJack,
  bonus,
  pending,
  onRoll,
}: SkillRowData & { pending: boolean; onRoll: () => void }) {
  const abilityLabel =
    ABILITY_SHORT[abilityKey] ??
    ABILITY_LABELS_PT[abilityKey]?.slice(0, 3) ??
    "—";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onRoll}
      className={cn(
        "grid w-full grid-cols-[auto_2.25rem_minmax(0,1fr)_2.5rem] items-baseline gap-x-2 px-3 py-1.5 text-left text-sm",
        "hover:bg-muted/30 disabled:opacity-60",
        isProficient && "bg-primary/[0.07]",
      )}
      title={`Rolar ${skill.name} (${ABILITY_LABELS_PT[abilityKey]})${isExpertise ? " · Especialização" : isJack ? " · Pau pra Toda Obra" : ""}`}
    >
      <span
        className={cn(
          "mt-0.5 size-1.5 shrink-0 self-center rounded-full",
          isExpertise
            ? "bg-primary ring-1 ring-primary/40 ring-offset-1 ring-offset-background"
            : isProficient
              ? "bg-primary"
              : isJack
                ? "bg-primary/50"
                : "bg-border",
        )}
        aria-label={
          isExpertise
            ? "Especialização"
            : isProficient
              ? "Proficiente"
              : isJack
                ? "Pau pra Toda Obra"
                : undefined
        }
        aria-hidden={!isProficient && !isJack}
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
        {isExpertise ? (
          <span className="ml-1 text-[0.65rem] font-normal text-primary">
            ×2
          </span>
        ) : isJack ? (
          <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">
            ½
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          "self-center text-right font-mono text-sm font-semibold tabular-nums",
          isProficient ? "text-primary" : "text-foreground",
        )}
      >
        {formatSkillBonus(bonus)}
      </span>
    </button>
  );
}
