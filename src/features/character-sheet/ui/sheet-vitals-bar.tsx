"use client";

import type { CharacterDetail } from "@/entities/character/types";
import { useCharacterState } from "@/features/character-sheet/api/use-character-state";
import {
  SheetHpBar,
  SheetStatTile,
} from "@/features/character-sheet/ui/sheet-ui";
import { cn } from "@/shared/lib/utils";

type SheetVitalsBarProps = {
  characterId: string;
  character: CharacterDetail;
  className?: string;
};

/** Barra sticky com o essencial em combate (PV / CA / PB / percepção). */
export function SheetVitalsBar({
  characterId,
  character,
  className,
}: SheetVitalsBarProps) {
  const stateQuery = useCharacterState(characterId);
  const state = stateQuery.data;

  const hpCurrent =
    state?.hitPointsCurrent ??
    character.hitPointsCurrent ??
    character.hitPointsMax;
  const hpMax = state?.hitPointsMax ?? character.hitPointsMax;
  const tempHp = state?.tempHp ?? 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-background/85 px-3 py-3 shadow-sm backdrop-blur-md",
        "supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2.5">
          <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            Pontos de vida
          </p>
          <div className="mt-1">
            <SheetHpBar current={hpCurrent} max={hpMax} temp={tempHp} />
          </div>
        </div>
        <SheetStatTile
          label="CA"
          value={character.armorClass}
          hint={character.armorClassNote ?? "sem armadura"}
          emphasize
        />
        <SheetStatTile
          label="Proficiência"
          value={`+${character.proficiencyBonus}`}
        />
        <SheetStatTile
          label="Perc. passiva"
          value={character.passivePerception}
        />
      </div>
    </div>
  );
}
