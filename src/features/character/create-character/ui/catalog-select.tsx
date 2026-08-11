"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/ui/field";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/ui/searchable-select";
import { cn } from "@/shared/lib/utils";

type CatalogSelectProps = {
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
};

export function CatalogSelect({
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
}: CatalogSelectProps) {
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
        placeholder={isLoading ? "Carregando…" : "Selecione"}
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
