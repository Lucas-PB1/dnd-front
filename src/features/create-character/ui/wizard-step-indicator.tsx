import { cn } from "@/shared/lib/utils";
import {
  visibleWizardSteps,
  type WizardNavOptions,
  type WizardStepId,
} from "@/features/create-character/model/wizard-steps";

type WizardStepIndicatorProps = {
  currentStep: WizardStepId;
  navOptions?: WizardNavOptions;
};

export function WizardStepIndicator({
  currentStep,
  navOptions,
}: WizardStepIndicatorProps) {
  const steps = visibleWizardSteps(navOptions);
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = currentIndex >= 0 && index < currentIndex;

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
