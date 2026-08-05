"use client";

import type { ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";
import { BeyondCombatHub } from "@/features/character/character-sheet/ui/beyond/combat/beyond-combat-hub";
import { BeyondCharacterStatsBar } from "@/features/character/character-sheet/ui/beyond/layout/beyond-ability-row";
import { BeyondLeftColumn } from "@/features/character/character-sheet/ui/beyond/layout/beyond-left-column";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { BeyondSkillsColumn } from "@/features/character/character-sheet/ui/beyond/layout/beyond-skills-column";
import { CharacterSheetPageSections } from "@/features/character/character-sheet/ui/sheet/character-sheet-page-sections";
import type { CharacterSheetPageSectionId } from "@/features/character/character-sheet/ui/sheet/character-sheet-tab-panels";
import { cn } from "@/shared/lib/utils";

type CharacterSheetMainGridProps = {
  characterId: string;
  character: CharacterDetail;
  languageNames: string[];
  skillsQuery: ReturnType<typeof useSkills>;
  pagePanels: Record<CharacterSheetPageSectionId, ReactNode>;
  onEditSkills: () => void;
  onEditAbilities: () => void;
};

export function CharacterSheetMainGrid({
  characterId,
  character,
  languageNames,
  skillsQuery,
  pagePanels,
  onEditSkills,
  onEditAbilities,
}: CharacterSheetMainGridProps) {
  return (
    <>
      <div className="shrink-0 rounded-xl border border-border/60 bg-card/45 p-2 shadow-sm">
        <BeyondCharacterStatsBar
          characterId={characterId}
          character={character}
          onEditAbilities={onEditAbilities}
        />
      </div>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-3",
          "xl:grid-cols-[15rem_minmax(0,1fr)_20rem]",
          "2xl:grid-cols-[16rem_minmax(0,1.35fr)_22rem]",
        )}
      >
        <aside className="order-3 min-w-0 xl:sticky xl:top-3 xl:order-1">
          <BeyondLeftColumn
            character={character}
            languageNames={languageNames}
          />
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-2 xl:order-2">
          <BeyondCombatHub characterId={characterId} character={character} />
          <CharacterSheetPageSections panels={pagePanels} />
        </div>

        <aside className="order-2 min-w-0 xl:sticky xl:top-3 xl:order-3">
          {skillsQuery.isPending ? (
            <BeyondPanel title="Perícias">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </BeyondPanel>
          ) : (
            <BeyondSkillsColumn
              character={character}
              skills={skillsQuery.data?.data ?? []}
              onEdit={onEditSkills}
            />
          )}
        </aside>
      </div>
    </>
  );
}
