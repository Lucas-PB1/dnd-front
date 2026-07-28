"use client";

import {
  BeyondCharacterStatsBar,
} from "@/features/character/character-sheet/ui/beyond/beyond-ability-row";
import { BeyondCombatHub } from "@/features/character/character-sheet/ui/beyond/beyond-combat-hub";
import { BeyondLeftColumn } from "@/features/character/character-sheet/ui/beyond/beyond-left-column";
import { BeyondMainTabs } from "@/features/character/character-sheet/ui/beyond/beyond-main-tabs";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/beyond-panel";
import { BeyondSkillsColumn } from "@/features/character/character-sheet/ui/beyond/beyond-skills-column";
import type { CharacterDetail } from "@/entities/character/types";
import type { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";
import type { BeyondTabId } from "@/features/character/character-sheet/ui/beyond/beyond-main-tabs";
import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

type CharacterSheetMainGridProps = {
  characterId: string;
  character: CharacterDetail;
  languageNames: string[];
  skillsQuery: ReturnType<typeof useSkills>;
  tabPanels: Record<BeyondTabId, ReactNode>;
  onEditSkills: () => void;
  onEditAbilities: () => void;
};

export function CharacterSheetMainGrid({
  characterId,
  character,
  languageNames,
  skillsQuery,
  tabPanels,
  onEditSkills,
  onEditAbilities,
}: CharacterSheetMainGridProps) {
  return (
    <>
      <div className="shrink-0">
        <BeyondCharacterStatsBar
          characterId={characterId}
          character={character}
          onEditAbilities={onEditAbilities}
        />
      </div>

      {/*
        Mobile order: combate → perícias → proffs
        Desktop: salvaguardas | perícias | combate+abas
        A página pode crescer além da viewport (scroll externo).
      */}
      <div
        className={cn(
          "grid gap-3",
          "grid-cols-1",
          "lg:grid-cols-[minmax(12rem,0.9fr)_minmax(17rem,1fr)_minmax(26rem,2.15fr)]",
          "xl:grid-cols-[14rem_20rem_minmax(0,1fr)]",
        )}
      >
        <div className="order-3 min-w-0 lg:order-1">
          <BeyondLeftColumn
            character={character}
            languageNames={languageNames}
          />
        </div>

        <div className="order-2 min-w-0 lg:order-2">
          {skillsQuery.isPending ? (
            <BeyondPanel title="Perícias">
              <p className="text-sm text-muted-foreground">Carregando…</p>
            </BeyondPanel>
          ) : (
            <BeyondSkillsColumn
              character={character}
              skills={skillsQuery.data?.data ?? []}
              onEdit={onEditSkills}
            />
          )}
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-2.5 lg:order-3">
          <BeyondCombatHub characterId={characterId} character={character} />
          <BeyondMainTabs panels={tabPanels} />
        </div>
      </div>
    </>
  );
}
