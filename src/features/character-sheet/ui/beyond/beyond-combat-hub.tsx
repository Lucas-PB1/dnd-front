"use client";

import { useState, type ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { abilityModifierValue, formatSkillBonus } from "@/entities/character";
import {
  useCharacterState,
  useTakeRest,
} from "@/features/character-sheet/api/use-character-state";
import { usePatchCharacter } from "@/features/character-sheet/api/use-patch-character";
import { SheetHpBar } from "@/features/character-sheet/ui/sheet-ui";
import { useSpeciesDetail } from "@/features/species-catalog/api/use-species";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type BeyondCombatHubProps = {
  characterId: string;
  character: CharacterDetail;
};

function StatBox({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-xl border px-3 py-2.5",
        emphasize
          ? "border-primary/40 bg-primary/8"
          : "border-border/70 bg-card/60",
      )}
    >
      <span className="text-[0.6rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-heading mt-1 text-2xl font-semibold tabular-nums leading-none">
        {value}
      </span>
      {hint ? (
        <span className="mt-1 max-w-[6rem] truncate text-center text-[10px] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function BeyondCombatHub({
  characterId,
  character,
}: BeyondCombatHubProps) {
  const stateQuery = useCharacterState(characterId);
  const takeRest = useTakeRest(characterId);
  const patch = usePatchCharacter(characterId);
  const speciesDetail = useSpeciesDetail(character.speciesSlug, true);

  const [delta, setDelta] = useState("");
  const state = stateQuery.data;

  const hpCurrent =
    state?.hitPointsCurrent ??
    character.hitPointsCurrent ??
    character.hitPointsMax;
  const hpMax = state?.hitPointsMax ?? character.hitPointsMax;
  const tempHp = state?.tempHp ?? 0;

  const initiative = abilityModifierValue(character.abilityScores.destreza);
  const speedLabel = speciesDetail.data?.speed ?? "—";

  async function applyHp(amount: number) {
    if (hpMax == null || hpCurrent == null) return;
    const next = Math.max(0, Math.min(hpMax, hpCurrent + amount));
    await patch.mutateAsync({ hitPointsCurrent: next });
    setDelta("");
  }

  function parseDelta() {
    const n = Number(delta);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-3">
      <div className="flex flex-wrap gap-2">
        <StatBox
          label="Iniciativa"
          value={formatSkillBonus(initiative)}
        />
        <StatBox
          label="CA"
          value={character.armorClass}
          hint={character.armorClassNote}
          emphasize
        />
        <StatBox label="Desloc." value={speedLabel} />
        <StatBox label="Prof." value={`+${character.proficiencyBonus}`} />
      </div>

      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Pontos de vida
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={takeRest.isPending}
              onClick={() => takeRest.mutate({ type: "short" })}
            >
              Descanso curto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={takeRest.isPending}
              onClick={() => takeRest.mutate({ type: "long" })}
            >
              Descanso longo
            </Button>
          </div>
        </div>
        <SheetHpBar current={hpCurrent} max={hpMax} temp={tempHp} />
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[5rem] flex-1">
            <label
              htmlFor="hp-delta"
              className="text-[0.65rem] text-muted-foreground uppercase"
            >
              Valor
            </label>
            <Input
              id="hp-delta"
              type="number"
              min={0}
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="0"
              className="mt-0.5"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={patch.isPending || !parseDelta()}
            onClick={() => applyHp(parseDelta())}
          >
            Curar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={patch.isPending || !parseDelta()}
            onClick={() => applyHp(-parseDelta())}
          >
            Dano
          </Button>
        </div>
        {state?.conditions?.length ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Condições: {state.conditions.join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
