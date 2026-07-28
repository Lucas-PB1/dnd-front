"use client";

import type { Control } from "react-hook-form";

import { useStepReview } from "@/features/create-character/lib/use-step-review";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  ReviewAbilitiesSection,
  ReviewChoicesSection,
  ReviewEquipmentSection,
  ReviewFeatsSection,
  ReviewIdentitySection,
  ReviewLanguagesSection,
  ReviewSkillsSection,
  ReviewSpellsSection,
} from "@/features/create-character/ui/steps/review-sections";

type StepReviewProps = {
  control: Control<CreateCharacterInput>;
};

export function StepReview({ control }: StepReviewProps) {
  const data = useStepReview(control);

  return (
    <div className="space-y-3">
      <ReviewIdentitySection data={data} />
      <ReviewAbilitiesSection data={data} />
      <ReviewSkillsSection data={data} />
      <ReviewChoicesSection data={data} />
      <ReviewFeatsSection data={data} />
      <ReviewEquipmentSection data={data} />
      <ReviewSpellsSection data={data} />
      <ReviewLanguagesSection data={data} />
    </div>
  );
}
