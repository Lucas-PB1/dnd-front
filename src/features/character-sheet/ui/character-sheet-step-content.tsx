"use client";

import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";
import type { CharacterWizardStepId } from "@/entities/character-sheet/wizard-steps";
import { CharacterSheetReview } from "@/features/character-sheet/ui/character-sheet-review";
import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import { StepAbilities } from "@/features/character-sheet/ui/steps/step-abilities";
import { StepClass } from "@/features/character-sheet/ui/steps/step-class";
import { StepCombat } from "@/features/character-sheet/ui/steps/step-combat";
import { StepEquipment } from "@/features/character-sheet/ui/steps/step-equipment";
import { StepFeatures } from "@/features/character-sheet/ui/steps/step-features";
import { StepIdentity } from "@/features/character-sheet/ui/steps/step-identity";
import { StepProficiencies } from "@/features/character-sheet/ui/steps/step-proficiencies";
import { StepSpells } from "@/features/character-sheet/ui/steps/step-spells";
import { StepStory } from "@/features/character-sheet/ui/steps/step-story";

type CharacterSheetStepContentProps = CharacterSheetFormProps & {
  stepId: CharacterWizardStepId;
  sheet: CharacterSheet;
  finalized: boolean;
  onFinalize: () => void;
  onEdit: () => void;
};

export function CharacterSheetStepContent({
  stepId,
  sheet,
  finalized,
  onFinalize,
  onEdit,
  ...formProps
}: CharacterSheetStepContentProps) {
  switch (stepId) {
    case "identity":
      return <StepIdentity {...formProps} />;
    case "class":
      return <StepClass {...formProps} />;
    case "abilities":
      return <StepAbilities {...formProps} />;
    case "proficiencies":
      return <StepProficiencies {...formProps} />;
    case "combat":
      return <StepCombat {...formProps} />;
    case "features":
      return <StepFeatures {...formProps} />;
    case "equipment":
      return <StepEquipment {...formProps} />;
    case "spells":
      return <StepSpells {...formProps} />;
    case "story":
      return <StepStory {...formProps} />;
    case "review":
      return (
        <CharacterSheetReview
          sheet={sheet}
          finalized={finalized}
          onFinalize={onFinalize}
          onEdit={onEdit}
        />
      );
  }
}
