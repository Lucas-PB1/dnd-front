"use client";

import { useCallback, useState } from "react";

import type { Ability } from "@/entities/character-sheet/constants";
import {
  ABILITIES,
  ABILITY_ABBREV,
} from "@/entities/character-sheet/constants";
import { formatAbilityModifier } from "@/entities/character-sheet/ability-modifier";
import {
  getBackgroundAbilityBonuses,
  ABILITY_LABELS_PT,
} from "@/entities/character-sheet/background-details";
import {
  setAbilityBaseScores,
  syncAbilityScoresWithOriginBonuses,
} from "@/features/character-sheet/model/apply-origin-benefits";
import {
  assignmentToScores,
  type AbilityScores,
  type AbilityScoreMethod,
} from "@/entities/character-sheet/ability-score-generation";
import { AbilityPointBuyPanel } from "@/features/character-sheet/ui/ability-generation/ability-point-buy-panel";
import { AbilityRollPanel } from "@/features/character-sheet/ui/ability-generation/ability-roll-panel";
import { AbilityStandardArrayPanel } from "@/features/character-sheet/ui/ability-generation/ability-standard-array-panel";
import { ABILITY_GENERATION_UI } from "@/features/character-sheet/ui/ability-generation/ability-generation-labels";
import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import { SheetSection } from "@/features/character-sheet/ui/sheet-primitives";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const METHODS: AbilityScoreMethod[] = ["pointBuy", "roll", "standardArray"];

function applyScoresToSheet(
  scores: AbilityScores,
  setValue: CharacterSheetFormProps["setValue"],
  watch: CharacterSheetFormProps["watch"],
) {
  setAbilityBaseScores(setValue, scores);
  syncAbilityScoresWithOriginBonuses(
    setValue,
    watch,
    watch("background"),
    watch("backgroundAbilityMode"),
    watch("backgroundAbilityPlus2"),
    watch("backgroundAbilityPlus1"),
  );
}

export function StepAbilities({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const [method, setMethod] = useState<AbilityScoreMethod>("pointBuy");
  const [generationComplete, setGenerationComplete] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState(false);
  const backgroundId = watch("background");
  const backgroundMode = watch("backgroundAbilityMode");
  const backgroundPlus2 = watch("backgroundAbilityPlus2");
  const backgroundPlus1 = watch("backgroundAbilityPlus1");
  const originBonuses = getBackgroundAbilityBonuses(
    backgroundId,
    backgroundMode,
    backgroundPlus2,
    backgroundPlus1,
  );

  const applyScores = useCallback(
    (scores: AbilityScores) => {
      applyScoresToSheet(scores, setValue, watch);
      setGenerationComplete(true);
      setAppliedMessage(true);
    },
    [setValue, watch],
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
    const bonus = originBonuses[ability];
    const final = Number.parseInt(
      watch(`abilities.${ability}.score`).trim(),
      10,
    );

    if (Number.isFinite(final)) {
      setValue(`abilityBaseScores.${ability}`, String(final - bonus));
      setValue(
        `abilities.${ability}.modifier`,
        formatAbilityModifier(String(final)) ?? "",
      );
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
          Você pode ajustar manualmente depois de gerar. Bônus do antecedente
          são somados automaticamente. O modificador é recalculado ao sair do
          campo de score.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITIES.map((ability) => {
            const bonus = originBonuses[ability];

            return (
              <div
                key={ability}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {ABILITY_ABBREV[ability]}
                </span>
                {bonus > 0 ? (
                  <span className="text-[10px] font-medium text-primary">
                    {ABILITY_LABELS_PT[ability]} +{bonus}
                  </span>
                ) : null}
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
            );
          })}
        </div>
      </SheetSection>
    </div>
  );
}
