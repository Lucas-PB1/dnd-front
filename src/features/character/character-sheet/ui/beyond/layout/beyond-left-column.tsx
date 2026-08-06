"use client";

import {
  EyeIcon,
  LanguageIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import type { AbilityScores, CharacterDetail } from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  abilityModifierValue,
  collectSaveProficiencyAbilities,
  computePassiveSkill,
  formatSkillBonus,
  sheetAbilityScores,
} from "@/entities/character";
import { useClassDetail } from "@/features/catalog/class-catalog/api/use-classes";
import { BeyondPanel, ABILITY_SHORT } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { CombatPassivesTrigger } from "@/features/character/character-sheet/ui/beyond/combat/combat-passives-trigger";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { cn } from "@/shared/lib/utils";

const ORDER = Object.keys(ABILITY_LABELS_PT) as (keyof AbilityScores)[];

const PASSIVE_SENSES = [
  {
    label: "Percepção passiva",
    skillSlug: "perception",
    abilityKey: "sabedoria" as const,
  },
  {
    label: "Intuição passiva",
    skillSlug: "insight",
    abilityKey: "sabedoria" as const,
  },
  {
    label: "Investigação passiva",
    skillSlug: "investigation",
    abilityKey: "inteligencia" as const,
  },
] as const;

type BeyondLeftColumnProps = {
  character: CharacterDetail;
  languageNames: string[];
};

export function BeyondLeftColumn({
  character,
  languageNames,
}: BeyondLeftColumnProps) {
  const classDetail = useClassDetail(character.classSlug, true);
  const rolls = useSheetRolls();
  const [useIndomitable, setUseIndomitable] = useState(false);
  const [useStrokeOfLuck, setUseStrokeOfLuck] = useState(false);
  const hasIndomitable =
    character.classSlug === "fighter" && character.level >= 9;
  const proficient = new Set(
    collectSaveProficiencyAbilities(
      classDetail.data?.savingThrowSlugs ?? [],
      character.featOptions,
    ),
  );
  if (character.classSlug === "rogue" && character.level >= 15) {
    proficient.add("sabedoria");
    proficient.add("carisma");
  }
  const pb = character.proficiencyBonus;
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

  return (
    <div className="flex flex-col gap-2.5">
      <BeyondPanel title="Salvaguardas" icon={ShieldCheckIcon}>
        {hasIndomitable ? (
          <label className="mb-1.5 block text-[0.68rem] text-muted-foreground">
            <input
              className="mr-1 align-middle"
              type="checkbox"
              checked={useIndomitable}
              onChange={(event) => setUseIndomitable(event.target.checked)}
            />
            Indomável: rerrolar com +{character.level}
          </label>
        ) : null}
        {character.classSlug === "rogue" && character.level >= 20 ? (
          <label className="mb-1.5 block text-[0.68rem] text-muted-foreground">
            <input
              className="mr-1 align-middle"
              type="checkbox"
              checked={useStrokeOfLuck}
              onChange={(event) => {
                setUseStrokeOfLuck(event.target.checked);
                if (event.target.checked) setUseIndomitable(false);
              }}
            />
            Golpe de Sorte: transformar falha em 20
          </label>
        ) : null}
        {classDetail.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <ul className="space-y-0.5">
            {ORDER.map((slug) => {
              const mod = abilityModifierValue(scores[slug]);
              const isProficient = proficient.has(slug);
              const total = mod + (isProficient ? pb : 0);
              return (
                <li key={slug}>
                  <button
                    type="button"
                    disabled={rolls.savingThrow.isPending}
                    onClick={() => {
                      rolls.savingThrow.mutate({
                        abilitySlug: slug,
                        indomitable: useIndomitable || undefined,
                        strokeOfLuck: useStrokeOfLuck || undefined,
                      });
                      setUseIndomitable(false);
                      setUseStrokeOfLuck(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm",
                      isProficient ? "bg-primary/10" : "hover:bg-muted/40",
                      "disabled:opacity-60",
                    )}
                    title={`Rolar salvaguarda de ${ABILITY_LABELS_PT[slug]}`}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        isProficient ? "bg-primary" : "bg-border",
                      )}
                      aria-hidden
                    />
                    <span className="w-7 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                      {ABILITY_SHORT[slug]}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {ABILITY_LABELS_PT[slug]}
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {formatSkillBonus(total)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </BeyondPanel>

      <CombatPassivesTrigger notes={character.classCombatNotes ?? []} />

      <BeyondPanel title="Sentidos" icon={EyeIcon}>
        <ul className="space-y-1.5 text-sm">
          {PASSIVE_SENSES.map((sense) => (
            <li
              key={sense.skillSlug}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5"
            >
              <span className="text-muted-foreground">{sense.label}</span>
              <span className="font-mono font-semibold tabular-nums">
                {computePassiveSkill(
                  sense.skillSlug,
                  scores[sense.abilityKey],
                  pb,
                  skillSources,
                )}
              </span>
            </li>
          ))}
        </ul>
      </BeyondPanel>

      <BeyondPanel title="Proficiências & idiomas" icon={LanguageIcon}>
        {classDetail.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <dl className="space-y-2.5 text-sm">
            {classDetail.data?.armorTrainingNames?.length ? (
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                  Armaduras
                </dt>
                <dd className="mt-0.5">
                  {classDetail.data.armorTrainingNames.join(", ")}
                </dd>
              </div>
            ) : null}
            {classDetail.data?.weaponProficiencyNames?.length ? (
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                  Armas
                </dt>
                <dd className="mt-0.5">
                  {classDetail.data.weaponProficiencyNames.join(", ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Idiomas
              </dt>
              <dd className="mt-0.5">
                {languageNames.length > 0 ? languageNames.join(", ") : "—"}
              </dd>
            </div>
          </dl>
        )}
      </BeyondPanel>
    </div>
  );
}
