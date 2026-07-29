"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import type {
  AbilityScores,
  CharacterDetail,
} from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  abilityModifier,
  sheetAbilityScores,
} from "@/entities/character";
import {
  useCharacterState,
  useTakeRest,
} from "@/features/character/character-sheet/api/use-character-state";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import { ABILITY_SHORT } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { useSpeciesDetail } from "@/features/catalog/species-catalog/api/use-species";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

const ORDER = Object.keys(ABILITY_LABELS_PT) as (keyof AbilityScores)[];

type BeyondCharacterStatsBarProps = {
  characterId: string;
  character: CharacterDetail;
  onEditAbilities?: () => void;
};

function StatCell({
  label,
  value,
  detail,
  emphasize = false,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center",
        emphasize
          ? "border-primary/45 bg-primary/8"
          : "border-border/70 bg-card/70",
      )}
    >
      <span className="truncate text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-heading mt-0.5 text-2xl font-semibold leading-none tabular-nums">
        {value}
      </span>
      {detail ? (
        <span className="mt-1 truncate text-[0.65rem] text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </div>
  );
}

/** Faixa superior no padrão da ficha: atributos + PB + movimento + PV. */
export function BeyondCharacterStatsBar({
  characterId,
  character,
  onEditAbilities,
}: BeyondCharacterStatsBarProps) {
  const stateQuery = useCharacterState(characterId);
  const patch = usePatchCharacter(characterId);
  const speciesDetail = useSpeciesDetail(character.speciesSlug, true);
  const [delta, setDelta] = useState("");

  const scores = sheetAbilityScores(character);
  const state = stateQuery.data;
  const hpCurrent =
    state?.hitPointsCurrent ??
    character.hitPointsCurrent ??
    character.hitPointsMax;
  const hpMax = state?.hitPointsMax ?? character.hitPointsMax;
  const tempHp = state?.tempHp ?? 0;

  function parsedDelta() {
    const value = Number(delta);
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  async function applyHp(direction: 1 | -1) {
    if (hpMax == null || hpCurrent == null) return;
    const next = Math.max(
      0,
      Math.min(hpMax, hpCurrent + parsedDelta() * direction),
    );
    await patch.mutateAsync({ hitPointsCurrent: next });
    setDelta("");
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-10 lg:gap-2">
      {ORDER.map((key) => (
        <button
          key={key}
          type="button"
          onClick={onEditAbilities}
          title={`Editar ${ABILITY_LABELS_PT[key]}`}
          className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <StatCell
            label={ABILITY_SHORT[key]}
            value={abilityModifier(scores[key])}
            detail={scores[key]}
          />
        </button>
      ))}

      <StatCell
        label="Proficiência"
        value={`+${character.proficiencyBonus}`}
        detail="bônus"
      />
      <StatCell
        label="Deslocamento"
        value={speciesDetail.data?.speed ?? "—"}
        detail="movimento"
      />

      <div className="col-span-3 rounded-lg border border-primary/45 bg-primary/8 p-2 sm:col-span-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <HeartIcon className="size-3 text-secondary" aria-hidden />
            Pontos de vida
          </span>
          <span className="font-heading text-xl font-semibold tabular-nums">
            {hpCurrent ?? "—"}
            <span className="text-muted-foreground"> / {hpMax ?? "—"}</span>
          </span>
          <span className="text-[0.65rem] text-muted-foreground">
            {tempHp > 0 ? `+${tempHp} temp` : "sem temp"}
            {state?.hitDiceMax != null ? (
              <>
                {" · "}
                {state.hitDiceCurrent}/{state.hitDiceMax}{" "}
                {state.hitDie ?? "DV"}
              </>
            ) : null}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <Input
            type="number"
            min={0}
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            aria-label="Valor de cura ou dano"
            placeholder="0"
            className="h-7 min-w-0 flex-1 px-2"
          />
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="gap-1"
            disabled={patch.isPending || !parsedDelta()}
            onClick={() => applyHp(1)}
          >
            <ArrowTrendingUpIcon className="size-3.5" aria-hidden />
            Curar
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            className="gap-1"
            disabled={patch.isPending || !parsedDelta()}
            onClick={() => applyHp(-1)}
          >
            <ArrowTrendingDownIcon className="size-3.5" aria-hidden />
            Dano
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BeyondRestActions({ characterId }: { characterId: string }) {
  const stateQuery = useCharacterState(characterId);
  const takeRest = useTakeRest(characterId);
  const [hitDiceSpent, setHitDiceSpent] = useState(1);
  const [lastHeal, setLastHeal] = useState<string | null>(null);

  const hitDiceCurrent = stateQuery.data?.hitDiceCurrent ?? 0;
  const hitDie = stateQuery.data?.hitDie ?? "DV";
  const maxSpend = Math.max(0, hitDiceCurrent);
  const spend = Math.min(Math.max(0, hitDiceSpent), maxSpend);

  async function shortRest() {
    const result = await takeRest.mutateAsync({
      type: "short",
      hitDiceSpent: spend,
    });
    if (result?.hitPointsHealed != null && result.hitPointsHealed > 0) {
      const rolls = result.hitDiceRolls?.join(", ") ?? "";
      setLastHeal(`+${result.hitPointsHealed} PV${rolls ? ` (${rolls})` : ""}`);
    } else {
      setLastHeal(spend > 0 ? "Sem cura efetiva" : null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-1 rounded-md border border-border/70 bg-card/60 px-1.5 py-0.5">
        <label
          htmlFor={`hit-dice-${characterId}`}
          className="text-[0.65rem] whitespace-nowrap text-muted-foreground"
        >
          {hitDie}
        </label>
        <Input
          id={`hit-dice-${characterId}`}
          type="number"
          min={0}
          max={maxSpend}
          value={spend}
          onChange={(event) => setHitDiceSpent(Number(event.target.value) || 0)}
          aria-label="Dados de vida a gastar no descanso curto"
          className="h-7 w-14 px-2"
          disabled={takeRest.isPending || maxSpend === 0}
        />
        <span className="text-[0.65rem] text-muted-foreground">
          / {hitDiceCurrent}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1"
        disabled={takeRest.isPending}
        onClick={() => void shortRest()}
      >
        <SunIcon className="size-3.5" aria-hidden />
        Descanso curto
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1"
        disabled={takeRest.isPending}
        onClick={() => {
          setLastHeal(null);
          takeRest.mutate({ type: "long" });
        }}
      >
        <MoonIcon className="size-3.5" aria-hidden />
        Descanso longo
      </Button>
      {lastHeal ? (
        <span className="text-xs text-muted-foreground" role="status">
          {lastHeal}
        </span>
      ) : null}
    </div>
  );
}
