"use client";

import {
  AcademicCapIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import type { AbilityScores, CharacterDetail } from "@/entities/character/types";
import {
  formatSkillBonus,
  sheetAbilityScores,
  skillCheckBonus,
  skillProficiencyRank,
  abilityModifierValue,
} from "@/entities/character";
import { classOrderSkillCheckBonus } from "@/entities/character/lib/class-order-effects";
import type { SkillSummary } from "@/entities/skill/types";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
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
      bonus:
        skillCheckBonus(
          abilityModifierValue(score),
          character.proficiencyBonus,
          rank,
        ) +
        classOrderSkillCheckBonus(
          skill.slug,
          character.classOptions,
          abilityModifierValue(scores.sabedoria),
        ),
    };
  });

  const proficientRows = withBonus
    .filter((r) => r.isProficient)
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name, "pt"));
  const otherRows = withBonus
    .filter((r) => !r.isProficient)
    .sort((a, b) => a.skill.name.localeCompare(b.skill.name, "pt"));

  function rollSkill(row: SkillRowData) {
    rolls.skill.mutate({
      skillSlug: row.skill.slug,
      strokeOfLuck: useStrokeOfLuck || undefined,
    });
    setUseStrokeOfLuck(false);
  }

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
    >
      {character.classSlug === "rogue" && character.level >= 20 ? (
        <label className="mb-1.5 block text-[0.68rem] text-muted-foreground">
          <input
            className="mr-1 align-middle"
            type="checkbox"
            checked={useStrokeOfLuck}
            onChange={(event) => setUseStrokeOfLuck(event.target.checked)}
          />
          Golpe de Sorte: transformar falha em 20
        </label>
      ) : null}

      <div className="space-y-3">
        {proficientRows.length > 0 ? (
          <SkillGroup label="Proficientes">
            {proficientRows.map((row) => (
              <SkillRow
                key={row.skill.slug}
                {...row}
                pending={rolls.skill.isPending}
                onRoll={() => rollSkill(row)}
              />
            ))}
          </SkillGroup>
        ) : null}

        {otherRows.length > 0 ? (
          <SkillGroup label={proficientRows.length > 0 ? "Outras" : undefined}>
            {otherRows.map((row) => (
              <SkillRow
                key={row.skill.slug}
                {...row}
                pending={rolls.skill.isPending}
                onRoll={() => rollSkill(row)}
              />
            ))}
          </SkillGroup>
        ) : null}
      </div>
    </BeyondPanel>
  );
}

function SkillGroup({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {label ? (
        <p className="mb-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <ul className="space-y-0.5">{children}</ul>
    </div>
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
  const { labelOf, shortOf } = useAbilityLabels();
  const abilityLabel = shortOf(abilityKey);
  const abilityFullLabel = labelOf(abilityKey);

  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={onRoll}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm",
          isProficient ? "bg-primary/10" : "hover:bg-muted/40",
          "disabled:opacity-60",
        )}
        title={`Rolar ${skill.name} (${abilityFullLabel})${isExpertise ? " · Especialização" : isJack ? " · Pau pra Toda Obra" : ""}`}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
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
          className="w-7 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase"
          title={abilityFullLabel}
        >
          {abilityLabel}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-medium",
            !isProficient && "text-foreground/85",
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
        <span className="font-mono text-sm font-semibold tabular-nums">
          {formatSkillBonus(bonus)}
        </span>
      </button>
    </li>
  );
}
