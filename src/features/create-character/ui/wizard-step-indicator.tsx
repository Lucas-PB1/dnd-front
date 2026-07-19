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
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Etapa{" "}
            <span className="font-medium text-foreground">
              {currentIndex + 1}
            </span>{" "}
            de {steps.length}
          </p>
          <p className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {current?.label ?? "—"}
          </p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
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
      </div>

      <ol className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isDone = currentIndex >= 0 && index < currentIndex;

          return (
            <li key={step.id} className="shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive &&
                    "border-primary bg-primary/10 text-primary shadow-sm",
                  isDone &&
                    !isActive &&
                    "border-border bg-muted/40 text-foreground",
                  !isActive &&
                    !isDone &&
                    "border-border/70 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    isActive && "bg-primary text-primary-foreground",
                    isDone && !isActive && "bg-secondary/50 text-foreground",
                    !isActive && !isDone && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {skipped.length > 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Etapas puladas: </span>
          {skipped.map((step) => step.label).join(", ")}
          <span> — não se aplicam a esta ficha.</span>
        </p>
      ) : null}
    </div>
  );
}
