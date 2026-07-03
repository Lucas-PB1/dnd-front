"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

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
