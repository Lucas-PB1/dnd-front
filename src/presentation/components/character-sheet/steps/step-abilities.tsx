"use client";

import { useCallback, useState } from "react";

import type { Ability } from "@/domain/character-sheet/constants";
import { ABILITIES, ABILITY_ABBREV } from "@/domain/character-sheet/constants";
import { formatAbilityModifier } from "@/domain/character-sheet/ability-modifier";
import {
  assignmentToScores,
  type AbilityScores,
  type AbilityScoreMethod,
} from "@/domain/character-sheet/ability-score-generation";
import { AbilityPointBuyPanel } from "@/presentation/components/character-sheet/ability-generation/ability-point-buy-panel";
import { AbilityRollPanel } from "@/presentation/components/character-sheet/ability-generation/ability-roll-panel";
import { AbilityStandardArrayPanel } from "@/presentation/components/character-sheet/ability-generation/ability-standard-array-panel";
import { ABILITY_GENERATION_UI } from "@/presentation/components/character-sheet/ability-generation/ability-generation-labels";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { SheetSection } from "@/presentation/components/character-sheet/sheet-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const METHODS: AbilityScoreMethod[] = ["pointBuy", "roll", "standardArray"];

function applyScoresToSheet(
  scores: AbilityScores,
  setValue: CharacterSheetFormProps["setValue"],
) {
  for (const ability of ABILITIES) {
    const score = String(scores[ability]);
    setValue(`abilities.${ability}.score`, score);
    setValue(
      `abilities.${ability}.modifier`,
      formatAbilityModifier(score) ?? "",
    );
  }
}

export function StepAbilities({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const [method, setMethod] = useState<AbilityScoreMethod>("pointBuy");
  const [generationComplete, setGenerationComplete] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState(false);

  const applyScores = useCallback(
    (scores: AbilityScores) => {
      applyScoresToSheet(scores, setValue);
      setGenerationComplete(true);
      setAppliedMessage(true);
    },
    [setValue],
  );

  const handlePointBuyChange = useCallback(
    (scores: AbilityScores, complete: boolean) => {
      setAppliedMessage(false);
      setGenerationComplete(complete);
      if (complete) {
        applyScores(scores);
      }
    },
    [applyScores],
  );

  const handleAssignmentChange = useCallback(
    (assigned: Record<Ability, number | null>, complete: boolean) => {
      setAppliedMessage(false);
      setGenerationComplete(complete);
      if (complete) {
        const scores = assignmentToScores(assigned);
        if (scores) {
          applyScores(scores);
        }
      }
    },
    [applyScores],
  );

  function handleAbilityScoreBlur(ability: (typeof ABILITIES)[number]) {
    const score = watch(`abilities.${ability}.score`);
    const modifier = formatAbilityModifier(score);

    if (modifier !== null) {
      setValue(`abilities.${ability}.modifier`, modifier);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Gerar atributos">
        <p className="mb-4 text-sm text-muted-foreground">
          {ABILITY_GENERATION_UI.pageHint}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {METHODS.map((entry) => (
            <Button
              key={entry}
              type="button"
              size="sm"
              variant={method === entry ? "default" : "outline"}
              onClick={() => {
                setMethod(entry);
                setGenerationComplete(false);
                setAppliedMessage(false);
              }}
            >
              {ABILITY_GENERATION_UI.methods[entry]}
            </Button>
          ))}
        </div>

        {method === "pointBuy" ? (
          <AbilityPointBuyPanel onChange={handlePointBuyChange} />
        ) : null}
        {method === "roll" ? (
          <AbilityRollPanel onAssignmentChange={handleAssignmentChange} />
        ) : null}
        {method === "standardArray" ? (
          <AbilityStandardArrayPanel
            onAssignmentChange={handleAssignmentChange}
          />
        ) : null}

        {appliedMessage ? (
          <p className="mt-4 text-sm text-primary">
            {ABILITY_GENERATION_UI.applied}
          </p>
        ) : null}
      </SheetSection>

      <SheetSection
        title="Atributos"
        className={cn(!generationComplete && "opacity-80")}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Você pode ajustar manualmente depois de gerar. O modificador é
          recalculado ao sair do campo de score.
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
              <input
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2 text-center text-lg font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="10"
                inputMode="numeric"
                {...register(`abilities.${ability}.score`)}
                onBlur={() => handleAbilityScoreBlur(ability)}
              />
              <input
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-center text-sm outline-none focus-visible:border-ring"
                placeholder="+0"
                {...register(`abilities.${ability}.modifier`)}
              />
            </div>
          ))}
        </div>
      </SheetSection>
    </div>
  );
}
