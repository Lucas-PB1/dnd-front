import { cn } from "@/shared/lib/utils";
import {
  skippedWizardSteps,
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
  const skipped = skippedWizardSteps(navOptions);
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const current = steps[currentIndex];
  const progress =
    steps.length <= 1
      ? 100
      : Math.round(((Math.max(currentIndex, 0) + 1) / steps.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-lg font-semibold tracking-tight">
          {current?.label ?? "—"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {currentIndex + 1}/{steps.length}
          </span>
        </p>
        {skipped.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Puladas: {skipped.map((step) => step.label).join(", ")}
          </p>
        ) : null}
      </div>

      <div
        className="h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do assistente: ${progress}%`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isDone = currentIndex >= 0 && index < currentIndex;

          return (
            <li key={step.id} className="shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors",
                  isActive &&
                    "border-primary bg-primary/10 text-primary",
                  isDone &&
                    !isActive &&
                    "border-border bg-muted/40 text-foreground",
                  !isActive &&
                    !isDone &&
                    "border-border/70 text-muted-foreground",
                )}
                title={step.label}
              >
                <span
                  className={cn(
                    "inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && !isActive && "bg-secondary/50 text-foreground",
                    !isActive && !isDone && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
