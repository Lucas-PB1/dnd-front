import { cn } from "@/shared/lib/utils";
import {
  WIZARD_STEPS,
  type WizardStepId,
  wizardStepIndex,
} from "@/features/create-character/model/wizard-steps";

type WizardStepIndicatorProps = {
  currentStep: WizardStepId;
};

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  const currentIndex = wizardStepIndex(currentStep);

  return (
    <ol className="flex flex-wrap gap-2">
      {WIZARD_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = index < currentIndex;

        return (
          <li
            key={step.id}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              isActive && "border-primary bg-primary/10 text-primary",
              isDone && !isActive && "border-border text-muted-foreground",
              !isActive &&
                !isDone &&
                "border-border/60 text-muted-foreground/70",
            )}
          >
            {index + 1}. {step.label}
          </li>
        );
      })}
    </ol>
  );
}
