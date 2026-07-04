import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

export function CatalogSelect({
  id,
  label,
  description,
  options,
  isLoading,
  error,
  ...props
}: {
  id: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  isLoading?: boolean;
  error?: { message?: string };
} & React.ComponentProps<"select">) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <select
        id={id}
        disabled={isLoading}
        aria-invalid={!!error}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:opacity-50 dark:bg-input/30",
        )}
        {...props}
      >
        <option value="">{isLoading ? "Carregando…" : "Selecione"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError errors={[error]} />
    </Field>
  );
}
