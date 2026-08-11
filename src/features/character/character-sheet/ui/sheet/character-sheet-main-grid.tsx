"use client";

import type { ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";
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
      <div className="shrink-0 rounded-xl border border-border/80 bg-card/50 p-2 shadow-sm backdrop-blur-[2px]">
        <BeyondCharacterStatsBar
          characterId={characterId}
          character={character}
          onEditAbilities={onEditAbilities}
        />
      </div>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-2.5",
          "xl:grid-cols-[17rem_minmax(0,1fr)_17rem]",
          "2xl:grid-cols-[18rem_minmax(0,1fr)_18rem]",
        )}
      >
        <aside className="order-3 min-w-0 xl:order-1">
          <BeyondLeftColumn
            character={character}
            languageNames={languageNames}
          />
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-2 xl:order-2">
          <CharacterSheetPageSections
            panels={pagePanels}
            character={character}
          />
        </div>

        <aside className="order-2 flex min-w-0 flex-col gap-2 xl:order-3">
          {character.attacksPerAction != null &&
          character.attacksPerAction > 1 ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-card/50 px-2.5 py-2 shadow-sm backdrop-blur-[2px]">
              <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Ataques por ação
              </span>
              <span className="font-heading text-sm font-semibold tabular-nums text-foreground">
                {character.attacksPerAction}
              </span>
            </div>
          ) : null}
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
