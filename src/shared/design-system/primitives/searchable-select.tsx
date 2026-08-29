"use client";

import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Segunda linha (stats, CA, dano…). */
  hint?: string;
};

export type SearchableSelectProps = {
  id?: string;
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Densidade tipográfica — `compact` para painéis estreitos (loja). */
  size?: "default" | "compact";
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  name?: string;
  onBlur?: () => void;
};

function optionEquals(
  a: SearchableSelectOption | null | undefined,
  b: SearchableSelectOption | null | undefined,
) {
  if (a == null || b == null) return a === b;
  return a.value === b.value;
}

export function SearchableSelect({
  id,
  options,
  value = "",
  onValueChange,
  disabled,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar…",
  emptyMessage = "Nenhum resultado",
  size = "default",
  className,
  name,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const selected =
    options.find((option) => option.value === value) ??
    (value === "" ? null : { value, label: value });
  const compact = size === "compact";
  const hasHint = Boolean(selected?.hint);

  return (
    <Combobox.Root
      items={options}
      value={selected}
      onValueChange={(next) => {
        onValueChange?.(next?.value ?? "");
      }}
      disabled={disabled}
      itemToStringLabel={(item) =>
        [item?.label, item?.hint].filter(Boolean).join(" ")
      }
      isItemEqualToValue={optionEquals}
      autoHighlight
    >
      {name ? (
        <input type="hidden" name={name} value={value} readOnly />
      ) : null}
      <Combobox.Trigger
        id={id}
        aria-invalid={ariaInvalid || undefined}
        aria-label={ariaLabel}
        onBlur={onBlur}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-background px-2 text-left text-foreground outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-card dark:text-foreground",
          "data-placeholder:text-muted-foreground",
          compact
            ? hasHint
              ? "min-h-9 py-1"
              : "h-7 py-0"
            : hasHint
              ? "min-h-10 py-1.5"
              : "h-8",
          compact ? "text-[11px] leading-tight" : "px-2.5 text-sm",
          ariaInvalid &&
            "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
          className,
        )}
      >
        <span className="min-w-0 flex-1 overflow-hidden">
          {selected ? (
            <span className="flex min-w-0 flex-col gap-0.5 leading-tight">
              <span className="truncate font-medium">{selected.label}</span>
              {selected.hint ? (
                <span
                  className={cn(
                    "truncate text-muted-foreground",
                    compact ? "text-[10px]" : "text-[11px]",
                  )}
                >
                  {selected.hint}
                </span>
              ) : null}
            </span>
          ) : (
            <span
              className={cn(
                "block truncate text-muted-foreground",
                compact ? "text-[11px]" : "text-sm",
              )}
            >
              {placeholder}
            </span>
          )}
        </span>
        <Combobox.Icon
          className={cn(
            "shrink-0 text-muted-foreground",
            compact ? "size-3.5" : "size-4",
          )}
        >
          <ChevronUpDownIcon
            aria-hidden
            className={compact ? "size-3.5" : "size-4"}
          />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner
          className="z-50 outline-none"
          align="start"
          sideOffset={4}
        >
          <Combobox.Popup
            className={cn(
              "flex w-[var(--anchor-width)] min-w-[min(100vw-2rem,16rem)] max-w-[var(--available-width)] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg outline-none",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
            aria-label={ariaLabel ?? placeholder}
          >
            <div className="border-b border-border p-1.5">
              <Combobox.Input
                placeholder={searchPlaceholder}
                className={cn(
                  "h-8 w-full rounded-md border border-input bg-background px-2.5 text-foreground outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-card",
                  compact ? "text-xs" : "text-sm",
                )}
              />
            </div>
            <Combobox.Empty
              className={cn(
                "px-3 py-3 text-muted-foreground",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {emptyMessage}
            </Combobox.Empty>
            <Combobox.List className="max-h-60 overflow-y-auto overscroll-contain p-1 empty:p-0">
              {(option: SearchableSelectOption) => (
                <Combobox.Item
                  key={option.value === "" ? "__empty__" : option.value}
                  value={option}
                  className={cn(
                    "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 outline-none select-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                    compact ? "py-1 text-xs" : "py-1.5 text-sm",
                  )}
                >
                  <Combobox.ItemIndicator className="col-start-1 flex items-center justify-center">
                    <CheckIcon aria-hidden className="size-3.5" />
                  </Combobox.ItemIndicator>
                  <span className="col-start-2 min-w-0">
                    <span className="block truncate font-medium">
                      {option.label}
                    </span>
                    {option.hint ? (
                      <span
                        className={cn(
                          "block truncate leading-snug text-muted-foreground",
                          compact ? "text-[10px]" : "text-[11px]",
                        )}
                      >
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
