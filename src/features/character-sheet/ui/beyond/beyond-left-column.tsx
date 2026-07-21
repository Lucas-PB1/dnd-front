"use client";

import type { AbilityScores, CharacterDetail } from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  abilityModifierValue,
  formatSkillBonus,
} from "@/entities/character";
import { useClassDetail } from "@/features/class-catalog/api/use-classes";
import { BeyondPanel, ABILITY_SHORT } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { useSpeciesDetail } from "@/features/species-catalog/api/use-species";
import { cn } from "@/shared/lib/utils";

const ORDER = Object.keys(ABILITY_LABELS_PT) as (keyof AbilityScores)[];

type BeyondLeftColumnProps = {
  character: CharacterDetail;
  languageNames: string[];
};

export function BeyondLeftColumn({
  character,
  languageNames,
}: BeyondLeftColumnProps) {
  const classDetail = useClassDetail(character.classSlug, true);
  const speciesDetail = useSpeciesDetail(character.speciesSlug, true);
  const proficient = new Set(classDetail.data?.savingThrowSlugs ?? []);
  const pb = character.proficiencyBonus;

  return (
    <div className="flex flex-col gap-3">
      <BeyondPanel title="Salvaguardas">
        <ul className="space-y-1">
          {ORDER.map((slug) => {
            const mod = abilityModifierValue(character.abilityScores[slug]);
            const isProficient = proficient.has(slug);
            const total = mod + (isProficient ? pb : 0);
            return (
              <li
                key={slug}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                  isProficient ? "bg-primary/10" : "hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    isProficient ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
                <span className="w-8 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {ABILITY_SHORT[slug]}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {ABILITY_LABELS_PT[slug]}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatSkillBonus(total)}
                </span>
              </li>
            );
          })}
        </ul>
      </BeyondPanel>

      <BeyondPanel title="Sentidos">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-2 py-1.5">
            <span className="text-muted-foreground">Percepção passiva</span>
            <span className="font-mono font-semibold tabular-nums">
              {character.passivePerception}
            </span>
          </li>
          {speciesDetail.data?.speed ? (
            <li className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-2 py-1.5">
              <span className="text-muted-foreground">Deslocamento</span>
              <span className="font-medium">{speciesDetail.data.speed}</span>
            </li>
          ) : null}
        </ul>
      </BeyondPanel>

      <BeyondPanel title="Proficiências & idiomas">
        <dl className="space-y-3 text-sm">
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
          <div>
            <dt className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Bônus de proficiência
            </dt>
            <dd className="mt-0.5 font-mono font-semibold">+{pb}</dd>
          </div>
        </dl>
      </BeyondPanel>
    </div>
  );
}
