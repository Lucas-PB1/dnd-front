"use client";

import { useState, type InputHTMLAttributes } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type SheetProficiencyProps = {
  proficient?: boolean;
  onProficientChange?: (value: boolean) => void;
  modifierProps?: InputHTMLAttributes<HTMLInputElement>;
  label: string;
  abilityAbbrev?: string;
};

export function SheetProficiencyRow({
  proficient,
  onProficientChange,
  modifierProps,
  label,
  abilityAbbrev,
}: SheetProficiencyProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1.75rem_2.75rem_1fr] items-center gap-2 rounded-md px-1 py-0.5 transition-colors",
        proficient && "bg-primary/5",
      )}
    >
      <button
        type="button"
        aria-label={`Proficiência em ${label}`}
        aria-pressed={proficient}
        onClick={() => onProficientChange?.(!proficient)}
        className="flex size-5 items-center justify-center justify-self-center rounded-full border-2 border-primary/50"
      >
        {proficient ? (
          <span className="size-2.5 rounded-full bg-primary" />
        ) : null}
      </button>
      <Input
        className="h-7 text-center text-xs"
        placeholder="+0"
        {...modifierProps}
      />
      <span className="text-sm">
        {label}
        {abilityAbbrev ? (
          <span className="ml-1 text-xs text-muted-foreground">
            ({abilityAbbrev})
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function SheetSection({
  id,
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
        {title}
      </h2>
      {collapsible ? (
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      ) : null}
    </div>
  );

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-36 rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mb-3 flex w-full items-center justify-between border-b border-border pb-2 text-left"
        >
          {header}
        </button>
      ) : (
        <div className="mb-3 border-b border-border pb-2">{header}</div>
      )}

      {open ? children : null}
    </section>
  );
}

export function DeathSaveTracker({
  successes,
  failures,
  onSuccessesChange,
  onFailuresChange,
}: {
  successes: number;
  failures: number;
  onSuccessesChange: (value: number) => void;
  onFailuresChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
          Successes
        </p>
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={`success-${index}`}
              type="button"
              aria-label={`Death save success ${index + 1}`}
              onClick={() =>
                onSuccessesChange(successes === index + 1 ? index : index + 1)
              }
              className="relative size-6 rounded-full border-2 border-emerald-600/60"
            >
              {successes > index ? (
                <span className="absolute inset-0.5 rounded-full bg-emerald-600" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
          Failures
        </p>
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={`failure-${index}`}
              type="button"
              aria-label={`Death save failure ${index + 1}`}
              onClick={() =>
                onFailuresChange(failures === index + 1 ? index : index + 1)
              }
              className="relative size-6 rounded-full border-2 border-destructive/60"
            >
              {failures > index ? (
                <span className="absolute inset-0.5 rounded-full bg-destructive" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
