"use client";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";
import type { CharacterWizardStepId } from "@/domain/character-sheet/wizard-steps";
import { CharacterSheetReview } from "@/presentation/components/character-sheet/character-sheet-review";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { StepAbilities } from "@/presentation/components/character-sheet/steps/step-abilities";
import { StepClass } from "@/presentation/components/character-sheet/steps/step-class";
import { StepCombat } from "@/presentation/components/character-sheet/steps/step-combat";
import { StepEquipment } from "@/presentation/components/character-sheet/steps/step-equipment";
import { StepFeatures } from "@/presentation/components/character-sheet/steps/step-features";
import { StepIdentity } from "@/presentation/components/character-sheet/steps/step-identity";
import { StepProficiencies } from "@/presentation/components/character-sheet/steps/step-proficiencies";
import { StepSpells } from "@/presentation/components/character-sheet/steps/step-spells";
import { StepStory } from "@/presentation/components/character-sheet/steps/step-story";

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
