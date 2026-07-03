"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { getCharacterSheetCompletion } from "@/features/character-sheet/model/sheet-completion";
import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";
import {
  CHARACTER_WIZARD_STEP_COUNT,
  CHARACTER_WIZARD_STEPS,
  REVIEW_STEP_INDEX,
} from "@/entities/character-sheet/wizard-steps";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CharacterSheetToolbarProps = {
  stepIndex: number;
  onStepChange: (index: number) => void;
  characterName: string;
  sheet: CharacterSheet;
  lastSavedAt: Date | null;
  finalized: boolean;
  onClear: () => void;
};

export function CharacterSheetToolbar({
  stepIndex,
  onStepChange,
  characterName,
  sheet,
  lastSavedAt,
  finalized,
  onClear,
}: CharacterSheetToolbarProps) {
  const completion = getCharacterSheetCompletion(sheet);
  const displayName = characterName.trim() || "Personagem sem nome";
  const currentStep = CHARACTER_WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isReviewStep = stepIndex === REVIEW_STEP_INDEX;

  return (
    <div className="sticky top-14 z-10 -mx-4 mb-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              Etapa {stepIndex + 1} de {CHARACTER_WIZARD_STEP_COUNT}:{" "}
              {currentStep.label}
              {finalized ? " · finalizada" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {completion}% preenchido
              {lastSavedAt
                ? ` · rascunho às ${lastSavedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFirstStep}
              onClick={() => onStepChange(stepIndex - 1)}
              aria-label="Etapa anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            <span
              className={cn(
                "rounded-md border border-border px-3 py-1 text-xs font-medium",
                isReviewStep && "border-primary/40 bg-primary/5 text-primary",
              )}
            >
              {currentStep.label}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReviewStep}
              onClick={() => onStepChange(stepIndex + 1)}
              aria-label="Próxima etapa"
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Limpar
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {currentStep.description}
        </p>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${((stepIndex + 1) / CHARACTER_WIZARD_STEP_COUNT) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
