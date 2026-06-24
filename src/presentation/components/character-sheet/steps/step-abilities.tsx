"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { formatAbilityModifier } from "@/domain/character-sheet/ability-modifier";
import {
  ABILITIES,
  ABILITY_ABBREV,
  ABILITY_LABELS,
} from "@/domain/character-sheet/constants";
import { Input } from "@/components/ui/input";
import { SheetSection } from "@/presentation/components/character-sheet/sheet-primitives";

export function StepAbilities({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  function handleAbilityScoreBlur(ability: (typeof ABILITIES)[number]) {
    const score = watch(`abilities.${ability}.score`);
    const modifier = formatAbilityModifier(score);

    if (modifier !== null) {
      setValue(`abilities.${ability}.modifier`, modifier);
    }
  }

  return (
    <SheetSection title="Atributos">
      <p className="mb-4 text-sm text-muted-foreground">
        Ao sair do campo de score, o modificador é calculado automaticamente.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => (
          <div
            key={ability}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
          >
            <span className="text-xs font-semibold uppercase tracking-wide">
              {ABILITY_ABBREV[ability]}
            </span>
            <Input
              className="h-10 text-center text-lg font-semibold"
              placeholder="10"
              inputMode="numeric"
              {...register(`abilities.${ability}.score`)}
              onBlur={() => handleAbilityScoreBlur(ability)}
            />
            <Input
              className="h-8 text-center text-sm"
              placeholder="+0"
              {...register(`abilities.${ability}.modifier`)}
            />
            <span className="text-[10px] text-muted-foreground">
              {ABILITY_LABELS[ability]}
            </span>
          </div>
        ))}
      </div>
    </SheetSection>
  );
}
