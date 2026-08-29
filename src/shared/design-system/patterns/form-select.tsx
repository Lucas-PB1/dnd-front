"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/design-system/primitives/field";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/design-system/primitives/searchable-select";
import { cn } from "@/shared/lib/utils";

export type FormSelectProps = {
  id: string;
  label: string;
  description?: string;
  options: SearchableSelectOption[];
  isLoading?: boolean;
  error?: { message?: string };
  disabled?: boolean;
  className?: string;
  value?: string;
  name?: string;
  onChange?: (event: { target: { value: string; name?: string } }) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  size?: "default" | "compact";
};

/**
 * Select com busca + Field (label, descrição, erro).
 * Padrão para wizard, ficha e filtros de catálogo.
 */
export function FormSelect({
  id,
  label,
  description,
  options,
  isLoading,
  error,
  className,
  disabled,
  value,
  name,
  onChange,
  onBlur,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  size,
}: FormSelectProps) {
  const hasEmptyOption = options.some((opt) => opt.value === "");
  const selectOptions = hasEmptyOption
    ? options
    : [
        {
          value: "",
          label: isLoading ? "Carregando…" : "Selecione",
        },
        ...options,
      ];

  const showLabel = label.trim().length > 0;
  const resolvedPlaceholder =
    placeholder ?? (isLoading ? "Carregando…" : "Selecione");

  return (
    <Field>
      {showLabel ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <SearchableSelect
        key={`${id}-${selectOptions.length}-${selectOptions[1]?.value ?? ""}`}
        id={id}
        name={name}
        options={selectOptions}
        value={value ?? ""}
        disabled={isLoading || disabled}
        aria-invalid={!!error}
        aria-label={showLabel ? undefined : id}
        placeholder={resolvedPlaceholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        size={size}
        className={cn(className)}
        onBlur={onBlur}
        onValueChange={(next) => {
          onChange?.({ target: { value: next, name } });
        }}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
