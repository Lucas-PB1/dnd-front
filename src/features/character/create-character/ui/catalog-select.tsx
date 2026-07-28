import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/ui/field";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";

export function CatalogSelect({
  id,
  label,
  description,
  options,
  isLoading,
  error,
  className,
  disabled,
  ...props
}: {
  id: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  isLoading?: boolean;
  error?: { message?: string };
  disabled?: boolean;
} & React.ComponentProps<"select">) {
  const hasEmptyOption = options.some((opt) => opt.value === "");

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <select
        id={id}
        disabled={isLoading || disabled}
        aria-invalid={!!error}
        className={cn(nativeSelectClassName, className)}
        {...props}
      >
        {!hasEmptyOption ? (
          <option value="">{isLoading ? "Carregando…" : "Selecione"}</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value === "" ? "__empty__" : opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError errors={[error]} />
    </Field>
  );
}
