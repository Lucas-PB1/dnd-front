"use client";

import { cn } from "@/shared/lib/utils";

type WizardFormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Menos padding e gap entre campos. */
  compact?: boolean;
};

/** Bloco visual consistente entre etapas do wizard de criação. */
export function WizardFormSection({
  title,
  description,
  children,
  className,
  compact = false,
}: WizardFormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card/40",
        compact ? "space-y-4 p-4" : "space-y-4 p-4 sm:p-5",
        className,
      )}
    >
      <div className={cn(description ? "space-y-1" : null)}>
        <h2 className="font-heading text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
