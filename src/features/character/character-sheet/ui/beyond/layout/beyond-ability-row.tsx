"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { abilityModifier, sheetAbilityScores } from "@/entities/character";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import {
  useCharacterState,
  useTakeRest,
} from "@/features/character/character-sheet/api/use-character-state";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

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
  title,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  emphasize?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <div
      title={title}
      className={cn(
        "flex h-full min-h-[3.75rem] w-full flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-center",
        emphasize
          ? "border-secondary/50 bg-secondary/10"
          : "border-border/70 bg-card/70",
        className,
      )}
    >
      <span className="w-full truncate text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-heading mt-0.5 text-xl font-semibold leading-none tabular-nums">
        {value}
      </span>
      <span className="mt-0.5 h-[0.85rem] truncate text-[0.6rem] leading-none text-muted-foreground">
        {detail ?? "\u00a0"}
      </span>
    </div>
  );
}

/** Faixa superior: atributos + PB + PV (cura/dano). */
export function BeyondCharacterStatsBar({
  characterId,
  character,
  onEditAbilities,
}: BeyondCharacterStatsBarProps) {
  const { labelOf, shortOf, orderedKeys } = useAbilityLabels();
  const stateQuery = useCharacterState(characterId);
  const patch = usePatchCharacter(characterId);
  const [delta, setDelta] = useState("");

  const scores = sheetAbilityScores(character);
  const state = stateQuery.data;
  const hpCurrent =
    state?.hitPointsCurrent ??
    character.hitPointsCurrent ??
    character.hitPointsMax;
  const hpMax = state?.hitPointsMax ?? character.hitPointsMax;
  const tempHp = state?.tempHp ?? 0;
  const hpPercent =
    hpCurrent != null && hpMax != null && hpMax > 0
      ? Math.round((hpCurrent / hpMax) * 100)
      : 0;
  const hpBarClass =
    hpPercent > 50
      ? "bg-chart-3"
      : hpPercent >= 25
        ? "bg-chart-2"
        : "bg-chart-1";

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
    <div className="grid grid-cols-3 items-stretch gap-1.5 sm:grid-cols-6 lg:grid-cols-9 lg:gap-1.5">
      {orderedKeys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={onEditAbilities}
          title={`Editar ${labelOf(key)}`}
          className="group h-full min-w-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <StatCell
            label={shortOf(key)}
            value={abilityModifier(scores[key])}
            detail={scores[key]}
          />
        </button>
      ))}

      <StatCell
        label="PB"
        value={`+${character.proficiencyBonus}`}
        detail="prof."
        title="Bônus de proficiência"
      />

      <div className="col-span-3 rounded-lg border border-secondary/50 bg-secondary/10 px-2 py-1.5 sm:col-span-6 lg:col-span-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-1 text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            <HeartIcon className="size-3 text-secondary" aria-hidden />
            PV
          </span>
          <span className="font-heading text-lg font-semibold tabular-nums">
            {hpCurrent ?? "—"}
            <span className="text-muted-foreground"> / {hpMax ?? "—"}</span>
          </span>
          <span className="text-[0.6rem] text-muted-foreground">
            {tempHp > 0 ? (
              <span className="font-semibold text-accent">+{tempHp} temp</span>
            ) : null}
            {state?.hitDiceMax != null ? (
              <>
                {tempHp > 0 ? " · " : null}
                {state.hitDiceCurrent}/{state.hitDiceMax}{" "}
                {state.hitDie ?? "DV"}
              </>
            ) : null}
          </span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={cn("h-full rounded-full transition-all", hpBarClass)}
            style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
          />
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-background/40 px-2">
        <label
          htmlFor={`hit-dice-${characterId}`}
          className="text-[0.65rem] font-medium whitespace-nowrap text-muted-foreground"
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
          className="h-7 w-12 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          disabled={takeRest.isPending || maxSpend === 0}
        />
        <span className="text-[0.65rem] tabular-nums text-muted-foreground">
          / {hitDiceCurrent}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 gap-1.5"
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
        className="h-8 gap-1.5"
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
