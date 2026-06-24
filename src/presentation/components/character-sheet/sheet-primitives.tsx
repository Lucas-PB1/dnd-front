"use client";

import {
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SheetInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  compact?: boolean;
  hint?: string;
};

export function SheetInput({
  label,
  compact,
  hint,
  className,
  id,
  ...props
}: SheetInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1", compact && "min-w-0")}>
      {label ? (
        <Label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {label}
        </Label>
      ) : null}
      <Input
        id={inputId}
        className={cn(
          compact && "h-7 text-xs",
          "transition-[box-shadow,border-color]",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type SheetTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function SheetTextarea({
  label,
  className,
  id,
  ...props
}: SheetTextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <Label
          htmlFor={textareaId}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {label}
        </Label>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          className,
        )}
        {...props}
      />
    </div>
  );
}

type SheetSelectProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
};

export function SheetSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione…",
  disabled,
}: SheetSelectProps) {
  const selectId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={selectId}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>
      <select
        id={selectId}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-[box-shadow,border-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type SheetCheckboxProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  title?: string;
};

export function SheetCheckbox({
  label,
  checked,
  onChange,
  title,
}: SheetCheckboxProps) {
  return (
    <label
      title={title ?? label}
      className="flex cursor-pointer items-center gap-2 text-sm"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="size-4 rounded border border-input accent-primary"
      />
      <span className="text-muted-foreground">{label}</span>
    </label>
  );
}

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
