"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { mergeCharacterSheet } from "@/application/character-sheet/merge-character-sheet";
import {
  createEmptyCharacterSheet,
  type CharacterSheet,
} from "@/application/character-sheet/character-sheet.schema";
import {
  CHARACTER_WIZARD_STEPS,
  REVIEW_STEP_INDEX,
} from "@/domain/character-sheet/wizard-steps";
import { CharacterSheetStepContent } from "@/presentation/components/character-sheet/character-sheet-step-content";
import { CharacterSheetToolbar } from "@/presentation/components/character-sheet/character-sheet-toolbar";
import {
  clearCharacterSheetDraft,
  useCharacterSheetDraft,
  useIsClient,
} from "@/presentation/hooks/use-character-sheet-draft";
import { Button } from "@/components/ui/button";

export function CharacterSheetForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [finalized, setFinalized] = useState(false);
  const isClient = useIsClient();
  const emptySheet = useMemo(() => createEmptyCharacterSheet(), []);

  const { register, control, watch, setValue, reset } = useForm<CharacterSheet>(
    {
      defaultValues: emptySheet,
    },
  );

  const watchedSheet = useWatch({ control, defaultValue: emptySheet });
  const sheet = mergeCharacterSheet(watchedSheet);
  const { lastSavedAt } = useCharacterSheetDraft(reset, sheet, isClient);

  const currentStep = CHARACTER_WIZARD_STEPS[stepIndex];
  const isReviewStep = stepIndex === REVIEW_STEP_INDEX;
  const isLastEditableStep = stepIndex === REVIEW_STEP_INDEX - 1;

  function handleClear() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Limpar toda a ficha? O rascunho local também será apagado.",
      )
    ) {
      return;
    }

    clearCharacterSheetDraft();
    reset(createEmptyCharacterSheet());
    setStepIndex(0);
    setFinalized(false);
  }

  function handleFinalize() {
    setFinalized(true);
  }

  function handleEditFromReview() {
    setFinalized(false);
    setStepIndex(0);
  }

  if (!isClient) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Carregando ficha…
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <CharacterSheetToolbar
        stepIndex={stepIndex}
        onStepChange={setStepIndex}
        characterName={sheet.characterName}
        sheet={sheet}
        lastSavedAt={lastSavedAt}
        finalized={finalized}
        onClear={handleClear}
      />

      <CharacterSheetStepContent
        stepId={currentStep.id}
        register={register}
        watch={watch}
        setValue={setValue}
        sheet={sheet}
        finalized={finalized}
        onFinalize={handleFinalize}
        onEdit={handleEditFromReview}
      />

      {!isReviewStep ? (
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((index) => index - 1)}
          >
            Anterior
          </Button>
          <Button
            type="button"
            onClick={() => setStepIndex((index) => index + 1)}
          >
            {isLastEditableStep ? "Ir para revisão" : "Próximo"}
          </Button>
        </div>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        Rascunho salvo automaticamente neste navegador. Nada vai para o
        servidor.
      </p>
    </form>
  );
}
