"use client";

import type { Ability } from "@/domain/character-sheet/constants";
import {
  ABILITY_LABELS_PT,
  findBackgroundDetails,
  type BackgroundAbilityMode,
} from "@/domain/character-sheet/background-details";
import { SheetSelect } from "@/presentation/components/character-sheet/sheet-primitives";
import { Button } from "@/components/ui/button";

type BackgroundAbilityPanelProps = {
  backgroundId: string;
  mode: BackgroundAbilityMode;
  plus2: string;
  plus1: string;
  onModeChange: (mode: BackgroundAbilityMode) => void;
  onPlus2Change: (ability: string) => void;
  onPlus1Change: (ability: string) => void;
};

export function BackgroundAbilityPanel({
  backgroundId,
  mode,
  plus2,
  plus1,
  onModeChange,
  onPlus2Change,
  onPlus1Change,
}: BackgroundAbilityPanelProps) {
  const definition = findBackgroundDetails(backgroundId);

  if (!definition) {
    return null;
  }

  const options = definition.abilityOptions.map((ability) => ({
    value: ability,
    label: ABILITY_LABELS_PT[ability],
  }));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div>
        <p className="text-sm font-medium">
          Valores de atributo do antecedente
        </p>
        <p className="text-xs text-muted-foreground">
          PHB 2024: +2 em um e +1 em outro, ou +1 nos três valores listados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "split" ? "default" : "outline"}
          onClick={() => onModeChange("split")}
        >
          +2 e +1
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "even" ? "default" : "outline"}
          onClick={() => onModeChange("even")}
        >
          +1 nos três
        </Button>
      </div>

      {mode === "split" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <SheetSelect
            label="+2"
            value={plus2}
            onChange={onPlus2Change}
            options={options.filter((entry) => entry.value !== plus1)}
            placeholder="Escolha o atributo +2"
          />
          <SheetSelect
            label="+1"
            value={plus1}
            onChange={onPlus1Change}
            options={options.filter((entry) => entry.value !== plus2)}
            placeholder="Escolha o atributo +1"
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          +1 em{" "}
          {definition.abilityOptions
            .map((ability) => ABILITY_LABELS_PT[ability as Ability])
            .join(", ")}
          .
        </p>
      )}
    </div>
  );
}
